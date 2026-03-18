import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Play() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(`puzzle-${id}`);
    if (saved) {
      setData(JSON.parse(saved));
    }
  }, [id]);

  if (!data) return <h2>Loading or puzzle not found</h2>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Play Puzzle</h1>

      <img src={data.image} width="300" alt="puzzle" />

      <p>
        Difficulty: {data.difficulty} x {data.difficulty}
      </p>

      {/* Next step: actual playable board here */}
    </div>
  );
}
