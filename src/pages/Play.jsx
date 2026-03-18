import { useParams } from "react-router-dom";

export default function Play() {
  const { id } = useParams();

  return (
    <div>
      <h1>Play Puzzle</h1>
      <p>{id}</p>
    </div>
  );
}
