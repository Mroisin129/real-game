import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

export default function Play() {
  const { id } = useParams();

  const [puzzle, setPuzzle] = useState(null);
  const [pieces, setPieces] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`puzzle-${id}`);
    if (!saved) return;

    const puzzleData = JSON.parse(saved);
    setPuzzle(puzzleData);

    if (puzzleData.image) {
      generatePuzzlePieces(puzzleData.image, puzzleData.difficulty);
    }
  }, [id]);

  function generatePuzzlePieces(imageSrc, difficulty) {
    const img = new Image();
    img.src = imageSrc;

    img.onload = () => {
      const size = 360;
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

  if (!puzzle) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Puzzle not found</h1>
        <p>This puzzle may not exist in this browser yet.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <h1>{puzzle.title || "Play Puzzle"}</h1>

      <p>
        Difficulty: {puzzle.difficulty} x {puzzle.difficulty}
      </p>

      <div style={{ marginBottom: 20 }}>
        <img
          src={puzzle.image}
          alt="reference"
          style={{
            maxWidth: 220,
            borderRadius: 8,
            display: "block",
          }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${puzzle.difficulty}, 60px)`,
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
              cursor: "grab",
              background: "#fff",
            }}
          >
            <img
              src={piece.src}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                display: "block",
              }}
            />
          </div>
        ))}
      </div>

      {completed && (
        <div
          style={{
            marginTop: 30,
            padding: 20,
            borderRadius: 12,
            background: "#f5f5f5",
          }}
        >
          <h2>🎉 Puzzle Complete!</h2>

          {puzzle.template === "standard" && (
            <p>{puzzle.message || "Nice job solving the puzzle."}</p>
          )}

          {puzzle.template === "message" && (
            <div>
              <h3>Secret Message</h3>
              <p>{puzzle.message}</p>
            </div>
          )}

          {puzzle.template === "coupon" && (
            <div>
              <h3>Coupon Reveal</h3>
              <p>{puzzle.message}</p>
            </div>
          )}

          {puzzle.template === "announcement" && (
            <div>
              <h3>Announcement</h3>
              <p>{puzzle.message}</p>
            </div>
          )}

          {puzzle.template === "invite" && (
            <div>
              <h3>You're Invited!</h3>
              <p>{puzzle.message}</p>
              {puzzle.eventDate && (
                <p>
                  <strong>Date:</strong> {puzzle.eventDate}
                </p>
              )}
              {puzzle.eventTime && (
                <p>
                  <strong>Time:</strong> {puzzle.eventTime}
                </p>
              )}
              {puzzle.eventLocation && (
                <p>
                  <strong>Location:</strong> {puzzle.eventLocation}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
