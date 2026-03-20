import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import html2canvas from "html2canvas";
import confetti from "canvas-confetti";
import { db } from "../firebase";
import BirthdayTemplate from "../components/templates/BirthdayTemplate.jsx";
import WeddingTemplate from "../components/templates/WeddingTemplate.jsx";
import PartyTemplate from "../components/templates/PartyTemplate.jsx";

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function Play() {
  const { id } = useParams();
  const captureRef = useRef(null);

  const [puzzleData, setPuzzleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [inviteImage, setInviteImage] = useState("");
  const [pieces, setPieces] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const [started, setStarted] = useState(false);
  const [solved, setSolved] = useState(false);
  const [imageReady, setImageReady] = useState(false);

  useEffect(() => {
    async function loadPuzzle() {
      try {
        setLoading(true);
        setError("");

        const docRef = doc(db, "puzzles", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setError("Puzzle not found.");
          setPuzzleData(null);
          return;
        }

        setPuzzleData(docSnap.data());
      } catch (err) {
        console.error("Error loading puzzle:", err);
        setError("Could not load this invite.");
        setPuzzleData(null);
      } finally {
        setLoading(false);
      }
    }

    loadPuzzle();
  }, [id]);

  const gridSize = Math.max(2, Number(puzzleData?.difficulty) || 3);
  const totalPieces = gridSize * gridSize;

  function renderInvite() {
    if (!puzzleData) return null;

    if (puzzleData.inviteTemplate === "birthday-photo") {
      return (
        <BirthdayTemplate
          title={puzzleData.title}
          subtitle={puzzleData.subtitle}
          message={puzzleData.message}
          eventDate={puzzleData.eventDate}
          eventTime={puzzleData.eventTime}
          eventLocation={puzzleData.eventLocation}
          photo={puzzleData.photo}
        />
      );
    }

    if (puzzleData.inviteTemplate === "wedding-elegant") {
      return (
        <WeddingTemplate
          title={puzzleData.title}
          subtitle={puzzleData.subtitle}
          message={puzzleData.message}
          eventDate={puzzleData.eventDate}
          eventTime={puzzleData.eventTime}
          eventLocation={puzzleData.eventLocation}
          nameFontSize={puzzleData.nameFontSize}
        />
      );
    }

    if (puzzleData.inviteTemplate === "party-modern") {
      return (
        <PartyTemplate
          title={puzzleData.title}
          subtitle={puzzleData.subtitle}
          message={puzzleData.message}
          eventDate={puzzleData.eventDate}
          eventTime={puzzleData.eventTime}
          eventLocation={puzzleData.eventLocation}
        />
      );
    }

    return <div className="card">Unknown template.</div>;
  }

  useEffect(() => {
    async function generateInviteImage() {
      if (!puzzleData || !captureRef.current) return;

      try {
        setImageReady(false);
        setInviteImage("");

        const images = captureRef.current.querySelectorAll("img");

        await Promise.all(
          Array.from(images).map((img) => {
            if (img.complete) return Promise.resolve();

            return new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
            });
          })
        );

        await new Promise((resolve) => setTimeout(resolve, 200));

        const canvas = await html2canvas(captureRef.current, {
          useCORS: true,
          scale: 2,
          backgroundColor: null
        });

        const dataUrl = canvas.toDataURL("image/png");
        setInviteImage(dataUrl);
        setImageReady(true);
      } catch (err) {
        console.error("Error creating invite image:", err);
        setError("Could not build the puzzle image.");
      }
    }

    if (puzzleData) {
      generateInviteImage();
    }
  }, [puzzleData]);

  useEffect(() => {
    if (!inviteImage) return;

    const ordered = Array.from({ length: totalPieces }, (_, index) => index);
    let shuffled = shuffleArray(ordered);

    if (shuffled.every((value, index) => value === index) && shuffled.length > 1) {
      [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
    }

    setPieces(shuffled);
    setSolved(false);
    setSelectedIndex(null);
    setDraggedIndex(null);
    setStarted(false);
  }, [inviteImage, totalPieces]);

  function fireConfetti() {
    confetti({
      particleCount: 140,
      spread: 90,
      origin: { y: 0.6 }
    });

    setTimeout(() => {
      confetti({
        particleCount: 90,
        spread: 120,
        origin: { x: 0.2, y: 0.6 }
      });

      confetti({
        particleCount: 90,
        spread: 120,
        origin: { x: 0.8, y: 0.6 }
      });
    }, 250);
  }

  function checkSolved(updatedPieces) {
    const isSolved = updatedPieces.every((value, index) => value === index);

    if (isSolved) {
      setSolved(true);
      setSelectedIndex(null);
      setDraggedIndex(null);
      fireConfetti();
    }
  }

  function swapPieces(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;

    const updated = [...pieces];
    [updated[fromIndex], updated[toIndex]] = [updated[toIndex], updated[fromIndex]];
    setPieces(updated);
    checkSolved(updated);
  }

  function handlePieceClick(index) {
    if (solved) return;

    if (selectedIndex === null) {
      setSelectedIndex(index);
      return;
    }

    if (selectedIndex === index) {
      setSelectedIndex(null);
      return;
    }

    swapPieces(selectedIndex, index);
  }

  function handleDragStart(index) {
    if (solved) return;
    setDraggedIndex(index);
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDrop(index) {
    if (solved || draggedIndex === null) return;
    swapPieces(draggedIndex, index);
    setDraggedIndex(null);
  }

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="card">
            <h2>Loading invite...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error || !puzzleData) {
    return (
      <div className="page">
        <div className="container">
          <div className="card">
            <h2>Invite unavailable</h2>
            <p>{error || "This invite could not be found."}</p>
          </div>
        </div>
      </div>
    );
  }

  const boardMaxWidth = 720;

  return (
    <div className="page play-page">
      <div className="container play-shell">
        <div className="hero hero-compact">
          <h1>{solved ? "Invite Unlocked" : puzzleData.title || "You’re Invited"}</h1>
          <p>
            {solved
              ? "You solved the puzzle."
              : "Swap the pieces into the correct order to unlock the invitation."}
          </p>
        </div>

        {!started && (
          <div className="card" style={{ textAlign: "center", maxWidth: 520, margin: "0 auto 18px" }}>
            <button
              type="button"
              className="button"
              onClick={() => setStarted(true)}
              disabled={!imageReady}
            >
              {imageReady ? "Start Puzzle" : "Preparing Puzzle..."}
            </button>
          </div>
        )}

        {started && !solved && inviteImage && (
          <div className="card">
            <div className="puzzle-wrap puzzle-wrap-centered">
              <div
                className="puzzle-board"
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                  gap: "0px",
                  width: "100%",
                  maxWidth: `${boardMaxWidth}px`,
                  margin: "0 auto",
                  overflow: "hidden",
                  borderRadius: "18px",
                  border: "1px solid rgba(0,0,0,0.08)",
                  background: "#fff"
                }}
              >
                {pieces.map((piece, index) => {
                  const row = Math.floor(piece / gridSize);
                  const col = piece % gridSize;

                  return (
                    <div
                      key={index}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(index)}
                      onClick={() => handlePieceClick(index)}
                      className={`puzzle-piece ${selectedIndex === index ? "active" : ""}`}
                      style={{
                        aspectRatio: "1 / 1",
                        cursor: "pointer",
                        userSelect: "none",
                        backgroundImage: `url(${inviteImage})`,
                        backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                        backgroundPosition: `${(col / Math.max(gridSize - 1, 1)) * 100}% ${(row / Math.max(gridSize - 1, 1)) * 100}%`,
                        backgroundRepeat: "no-repeat",
                        boxSizing: "border-box",
                        border:
                          selectedIndex === index
                            ? "2px solid rgba(124,58,237,0.55)"
                            : "1px solid rgba(0,0,0,0.06)"
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {solved && <div className="card">{renderInvite()}</div>}

        <div
          style={{
            position: "absolute",
            left: "-9999px",
            top: 0,
            width: "800px",
            pointerEvents: "none",
            opacity: 1
          }}
        >
          <div ref={captureRef}>{renderInvite()}</div>
        </div>
      </div>
    </div>
  );
}
