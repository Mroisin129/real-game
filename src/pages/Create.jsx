import { useState } from "react";
import confetti from "canvas-confetti";

export default function Create() {
  const [image, setImage] = useState(null);
  const [difficulty, setDifficulty] = useState(3);
  const [pieces, setPieces] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [completed, setCompleted] = useState(false);

  const difficulties = {
    Easy: 3,
    Medium: 6,
    Hard: 10,
    Insane: 16,
  };

  function handleUpload(e) {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setPieces([]);
      setCompleted(false);
    }
  }

  function generatePuzzle() {
    if (!image) return;

    const img = new Image();
    img.src = image;

    img.onload = () => {
      const size = 300;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = size;
      canvas.height = size;

      ctx.drawImage(img, 0, 0, size, size);

      const pieceSize = size / difficulty;
      let newPieces = [];

      for (let row = 0; row < difficulty; row++) {
        for (let col = 0; col < difficulty; col++) {
          const pieceCanvas = document.createElement("canvas");
          pieceCanvas.width = pieceSize;
          pieceCanvas.height = pieceSize;

          const pieceCtx = pieceCanvas.getContext("2d");

          pieceCtx.drawImage(
            canvas,
            col * pieceSize,
            row * pieceSize,
            pieceSize,
            pieceSize,
            0,
            0,
            pieceSize,
            pieceSize
          );

          newPieces.push({
            id: `${row}-${col}`,
            src: pieceCanvas.toDataURL(),
            correctIndex: row * difficulty + col,
          });
        }
      }

      // shuffle
      newPieces = newPieces.sort(() => Math.random() - 0.5);

      setPieces(newPieces);
      setCompleted(false);
    };
  }

  function handleDrop(targetIndex) {
    if (draggedIndex === null) return;

    const updated = [...pieces];
    const temp = updated[draggedIndex];
    updated[draggedIndex] = updated[targetIndex];
    updated[targetIndex] = temp;

    setPieces(updated);
    setDraggedIndex(null);

    checkCompletion(updated);
  }

  function checkCompletion(piecesArray) {
    const isComplete = piecesArray.every(
      (piece, index) => piece.correctIndex === index
    );

    if (isComplete) {
      setCompleted(true);
      fireConfetti();
    }
  }

  function fireConfetti() {
    confetti({
      particleCount: 200,
      spread: 120,
      origin: { y: 0.6 },
    });
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Create Puzzle</h1>

      {/* Upload */}
      <input type="file" accept="image/*" onChange={handleUpload} />

      {/* Difficulty */}
      <h3>Select Difficulty:</h3>
      {Object.entries(difficulties).map(([label, value]) => (
        <button
          key={label}
          onClick={() => setDifficulty(value)}
          style={{
            margin: 5,
            padding: 10,
            background: difficulty === value ? "#333" : "#ccc",
            color: difficulty === value ? "#fff" : "#000",
          }}
        >
          {label}
        </button>
      ))}

      <p>
        {difficulty} x {difficulty}
      </p>

      {/* Generate */}
      {image && (
        <div>
          <img src={image} width="200" alt="preview" />
          <br />
          <button onClick={generatePuzzle}>Generate Puzzle</button>
        </div>
      )}
      <button onClick={savePuzzle} style={{ marginTop: 10 }}>
        Share Puzzle
      </button>

      {/* Puzzle Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${difficulty}, 60px)`,
          gap: 2,
          marginTop: 20,
        }}
      >
        {pieces.map((piece, index) => (
          <div
            key={piece.id}
            draggable
            onDragStart={() => setDraggedIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(index)}
            style={{
              width: 60,
              height: 60,
              border: "1px solid black",
            }}
          >
            <img
              src={piece.src}
              alt=""
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        ))}
      </div>

      {/* Completion Message */}
      {completed && <h2 style={{ marginTop: 20 }}>🎉 Puzzle Complete!</h2>}
    </div>
  );
}
function savePuzzle() {
  const id = Math.random().toString(36).substring(2, 9);

  const puzzleData = {
    image,
    difficulty,
  };

  localStorage.setItem(`puzzle-${id}`, JSON.stringify(puzzleData));

  const link = `${window.location.origin}/puzzle/${id}`;

  alert("Share this link:\n" + link);
}
export default function Create() {
  // state here...

  function savePuzzle() {
    // code here...
  }

  return ( ... )
}
