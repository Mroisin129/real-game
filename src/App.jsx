import { Routes, Route } from "react-router-dom";
import Create from "./pages/Create";
import Play from "./pages/Play";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Create />} />
      <Route path="/puzzle/:id" element={<Play />} />
    </Routes>
  );
}
