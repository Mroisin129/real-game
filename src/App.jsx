import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CreateLanding from "./pages/CreateLanding";
import CreatePuzzle from "./pages/CreatePuzzle";
import CreateTrivia from "./pages/CreateTrivia";
import CreateScratchoff from "./pages/CreateScratchoff";
import CreateLocked from "./pages/CreateLocked";
import Play from "./pages/Play";
import PlayTrivia from "./pages/PlayTrivia.jsx";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/create" element={<CreateLanding />} />
      <Route path="/create/puzzle" element={<CreatePuzzle />} />
      <Route path="/create/trivia" element={<CreateTrivia />} />
      <Route path="/create/scratchoff" element={<CreateScratchoff />} />
      <Route path="/create/locked" element={<CreateLocked />} />
      <Route path="/puzzle/:id" element={<Play />} />
      <Route path="/trivia/:id" element={<PlayTrivia />} />
    </Routes>
  );
}