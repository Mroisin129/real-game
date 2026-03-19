import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import confetti from "canvas-confetti";
import { db } from "../firebase";

export default function Play() {
  const { id } = useParams();

  const [puzzle, setPuzzle] = useState(null);
  const [pieces, setPieces] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPuzzle() {
      try {
        const docRef = doc(db, "puzzles", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setPuzzle(null);
          setLoading(false);
          return;
        }

        const puzzleData = docSnap.data();
        setPuzzle(puzzleData);

        if (puzzleData.image) {
          generatePuzzlePieces(puzzleData.image, puzzleData.difficulty);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error loading puzzle:", error);
        setPuzzle(null);
        setLoading(false);
      }
    }

    loadPuzzle();
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
            correctIndex: row * difficulty + col
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
      confetti({
        particleCount: 220,
        spread: 120,
        origin: { y: 0.6 }
      });
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="card">
            <h1>Loading puzzle...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className="page">
        <div className="container">
          <div className="card">
            <h1>Puzzle not found</h1>
            <p className="meta">
              This puzzle may have been deleted or the link may be incorrect.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="play-header">
          <div>
            <h1 style={{ margin: 0 }}>{puzzle.title || "Play Puzzle"}</h1>
            <p className="meta" style={{ marginTop: 8 }}>
              Difficulty: {puzzle.difficulty} × {puzzle.difficulty}
            </p>
          </div>

          <img
            src={puzzle.image}
            alt="Reference"
            className="reference-image"
          />
        </div>

        <div className="puzzle-wrap">
          <div
            className="puzzle-grid"
            style={{
              gridTemplateColumns: `repeat(${puzzle.difficulty}, 60px)`
            }}
          >
            {pieces.map((piece, index) => (
              <div
                key={piece.id}
                className="puzzle-piece"
                draggable
                onDragStart={() => setDraggedIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(index)}
                style={{ width: 60, height: 60 }}
              >
                <img src={piece.src} alt="" />
              </div>
            ))}
          </div>
        </div>

        {completed && (
          <div className="reveal-card">
            <div className="badge">Solved</div>
            <h2 style={{ marginTop: 0 }}>🎉 Puzzle Complete!</h2>

            {puzzle.template === "invite" ? (
              <div>
                <h3>You’re Invited!</h3>
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
            ) : (
              <p>{puzzle.message || "Nice job solving the puzzle."}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

