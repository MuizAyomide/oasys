
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Welcome from "./pages/Welcome";
import Calendar from "./pages/Calendar";
import DailyWords from "./pages/DailyWords";
import Challenge from "./pages/Challenge";
import Results from "./pages/Results";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/words/:date" element={<DailyWords />} />
        <Route path="/challenge/:date" element={<Challenge />} />
        <Route path="/results/:date" element={<Results />} />
        <Route path="*" element={<Welcome />} />
      </Routes>
    </BrowserRouter>
  );
}
