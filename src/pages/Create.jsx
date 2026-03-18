import { useState } from "react";

export default function Create() {
  const [image, setImage] = useState(null);
  const [difficulty, setDifficulty] = useState(3);
  const [pieces, setPieces] = useState([]);

  const difficulties = {
    Easy: 3,
    Medium: 6,
    Hard: 10,
    Insane: 16,
  };

  function handleUpload(e) {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
    }
  }

  function generatePuzzle() {
    if (!image) return;

    const img = new Image();
    img.src = image;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const size = 300; // fixed size for now
      canvas.width = size;
      canvas.height = size;

      ctx.drawImage(img, 0, 0, size, size);

      const pieceWidth = size / difficulty;
      const pieceHeight = size / difficulty;

      let newPieces = [];

      for (let row = 0; row < difficulty; row++) {
        for (let col = 0; col < difficulty; col++) {
          const pieceCanvas = document.createElement("canvas");
          pieceCanvas.width = pieceWidth;
          pieceCanvas.height = pieceHeight;

          const pieceCtx = pieceCanvas.getContext("2d");

          pieceCtx.drawImage(
            canvas,
            col * pieceWidth,
            row * pieceHeight,
            pieceWidth,
            pieceHeight,
            0,
            0,
            pieceWidth,
            pieceHeight
          );

          newPieces.push({
            id: `${row}-${col}`,
            src: pieceCanvas.toDataURL(),
            correctIndex: row * difficulty + col,
            currentIndex: row * difficulty + col,
          });
        }
      }

      setPieces(newPieces);
    };
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Create Puzzle</h1>

      <input type="file" accept="image/*" onChange={handleUpload} />

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

      {image && (
        <div>
          <img src={image} width="200" />
          <br />
          <button onClick={generatePuzzle}>Generate Puzzle</button>
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", marginTop: 20 }}>
        {pieces.map((piece) => (
          <img
            key={piece.id}
            src={piece.src}
            style={{
              width: 60,
              height: 60,
              margin: 2,
              border: "1px solid black",
            }}
          />
        ))}
      </div>
    </div>
  );
}
