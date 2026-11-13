
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const AuthContext = createContext(null);

async function checkAdminRole(user) {
  if (!user || user.isAnonymous) return false;

  const adminRef = doc(db, "admins", user.uid);
  const adminSnapshot = await getDoc(adminRef);

  if (!adminSnapshot.exists()) return false;

  const data = adminSnapshot.data();

  return data.role === "admin" && data.active === true;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (!active) return;

        setLoading(true);
        setAuthError("");

        if (!firebaseUser) {
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        try {
          const authorized = await checkAdminRole(firebaseUser);

          if (!active) return;

          setUser(firebaseUser);
          setIsAdmin(authorized);
        } catch (error) {
          console.error("Admin verification failed:", error);

          if (!active) return;

          setUser(firebaseUser);
          setIsAdmin(false);
          setAuthError("Unable to verify administrator access.");
        } finally {
          if (active) setLoading(false);
        }
      },
      (error) => {
        if (!active) return;

        console.error("Authentication error:", error);
        setUser(null);
        setIsAdmin(false);
        setAuthError("Authentication could not be initialized.");
        setLoading(false);
      }
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  async function login(email, password) {
    const credentials = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    try {
      const authorized = await checkAdminRole(credentials.user);

      if (!authorized) {
        await signOut(auth);
        throw new Error(
          "This account is not authorized to access the admin panel."
        );
      }

      setUser(credentials.user);
      setIsAdmin(true);
      setAuthError("");

      return credentials.user;
    } catch (error) {
      if (auth.currentUser?.uid === credentials.user.uid) {
        await signOut(auth);
      }
      throw error;
    }
  }

  async function logout() {
    await signOut(auth);
    setUser(null);
    setIsAdmin(false);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        authError,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
