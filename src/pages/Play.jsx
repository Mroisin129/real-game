import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import confetti from "canvas-confetti";
import { db } from "../firebase";

export default function Play() {
  const { id } = useParams();

  const [invite, setInvite] = useState(null);
  const [pieces, setPieces] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showReference, setShowReference] = useState(false);
  const [pieceSize, setPieceSize] = useState(80);

  function updatePieceSize(difficulty) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const availableWidth = width - 80;
    const availableHeight = height - 260;
    const boardSize = Math.min(availableWidth, availableHeight, 900);
    setPieceSize(Math.max(32, Math.floor(boardSize / difficulty)));
  }

  useEffect(() => {
    async function loadInvite() {
      try {
        console.log("Loading invite", id);

        const docRef = doc(db, "puzzles", id);
        const docSnap = await getDoc(docRef);

        console.log("Doc exists:", docSnap.exists());

        if (!docSnap.exists()) {
          setInvite(null);
          setLoading(false);
          return;
        }

        const data = docSnap.data();
        const sourceImage = data.inviteImage || data.image || null;

        const normalized = {
          ...data,
          sourceImage
        };

        setInvite(normalized);

        if (sourceImage && data.difficulty) {
          updatePieceSize(data.difficulty);
          buildPieces(sourceImage, data.difficulty);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error loading invite:", error);
        setInvite(null);
        setLoading(false);
      }
    }

    loadInvite();
  }, [id]);

  useEffect(() => {
    if (!invite) return;

    function handleResize() {
      updatePieceSize(invite.difficulty);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [invite]);

  function buildPieces(imageSrc, difficulty) {
    const img = new Image();
    img.src = imageSrc;

    img.onload = () => {
      const size = 1200;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(img, 0, 0, size, size);

      const sourcePieceSize = size / difficulty;
      const newPieces = [];

      for (let row = 0; row < difficulty; row++) {
        for (let col = 0; col < difficulty; col++) {
          const pieceCanvas = document.createElement("canvas");
          pieceCanvas.width = sourcePieceSize;
          pieceCanvas.height = sourcePieceSize;

          const pieceCtx = pieceCanvas.getContext("2d");
          pieceCtx.drawImage(
            canvas,
            col * sourcePieceSize,
            row * sourcePieceSize,
            sourcePieceSize,
            sourcePieceSize,
            0,
            0,
            sourcePieceSize,
            sourcePieceSize
          );

          newPieces.push({
            id: `${row}-${col}`,
            src: pieceCanvas.toDataURL(),
            correctIndex: row * difficulty + col
          });
        }
      }

      newPieces.sort(() => Math.random() - 0.5);
      setPieces(newPieces);
      setCompleted(false);
    };

    img.onerror = () => {
      console.error("Failed to load source image for puzzle.");
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

    const isComplete = updated.every(
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
      <div className="page play-page">
        <div className="play-shell">
          <div className="card">
            <h1>Loading invite...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="page play-page">
        <div className="play-shell">
          <div className="card">
            <h1>Invite not found</h1>
            <p className="meta">
              This invite may have been deleted or the link may be incorrect.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page play-page">
      <div className="play-shell">
        <div className="play-topbar">
          <div>
            <h1 style={{ margin: 0 }}>{invite.title || "Play Invite"}</h1>
            <p className="meta" style={{ marginTop: 8 }}>
              Difficulty: {invite.difficulty} × {invite.difficulty}
            </p>
          </div>

          <div className="reference-panel">
            <button
              type="button"
              className="button-secondary"
              onClick={() => setShowReference((prev) => !prev)}
            >
              {showReference ? "Hide Invite Preview" : "Show Invite Preview"}
            </button>

            {showReference && invite.sourceImage && (
              <img
                src={invite.sourceImage}
                alt="Invite Preview"
                className="reference-image"
              />
            )}
          </div>
        </div>

        <div className="board-stage">
          <div
            className="puzzle-grid"
            style={{
              gridTemplateColumns: `repeat(${invite.difficulty}, ${pieceSize}px)`
            }}
          >
            {pieces.map((piece, index) => (
              <div
                key={piece.id}
                className="puzzle-piece puzzle-piece-shaped"
                draggable
                onDragStart={() => setDraggedIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(index)}
                style={{ width: pieceSize, height: pieceSize }}
              >
                <img src={piece.src} alt="" />
              </div>
            ))}
          </div>
        </div>

        {completed && (
          <div className="reveal-card">
            <div className="badge">Unlocked</div>
            <h2 style={{ marginTop: 0 }}>🎉 Invite Unlocked!</h2>
            {invite.subtitle && <p><strong>{invite.subtitle}</strong></p>}
            {invite.message && <p>{invite.message}</p>}
            {invite.eventDate && <p><strong>Date:</strong> {invite.eventDate}</p>}
            {invite.eventTime && <p><strong>Time:</strong> {invite.eventTime}</p>}
            {invite.eventLocation && (
              <p><strong>Location:</strong> {invite.eventLocation}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
