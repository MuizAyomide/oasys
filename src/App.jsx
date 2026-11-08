
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Welcome from "./pages/Welcome";
import Calendar from "./pages/Calendar";
import DailyWords from "./pages/DailyWords";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/words/:date" element={<DailyWords />} />
        <Route path="*" element={<Welcome />} />
      </Routes>
    </BrowserRouter>
  );
}
