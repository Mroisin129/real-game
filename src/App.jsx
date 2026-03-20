import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CreateLanding from "./pages/CreateLanding";
import CreatePuzzle from "./pages/CreatePuzzle";
import CreateTrivia from "./pages/CreateTrivia";
import CreateScratchoff from "./pages/CreateScratchOff.jsx";
import CreateLockedMessage from "./pages/CreateLockedMessage.jsx";
import LockedMessageReveal from "./pages/LockedMessageReveal.jsx";
import Play from "./pages/Play";
import PlayTrivia from "./pages/PlayTrivia.jsx";
import ScratchReveal from "./pages/ScratchReveal";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/create" element={<CreateLanding />} />
      <Route path="/create/puzzle" element={<CreatePuzzle />} />
      <Route path="/create/trivia" element={<CreateTrivia />} />
      <Route path="/create/scratchoff" element={<CreateScratchoff />} />
      <Route path="/scratch/:id" element={<ScratchReveal />} />
      <Route path="/create-locked" element={<CreateLockedMessage />} />
      <Route path="/locked/:id" element={<LockedMessageReveal />} />
      <Route path="/puzzle/:id" element={<Play />} />
      <Route path="/trivia/:id" element={<PlayTrivia />} />
    </Routes>
  );
}