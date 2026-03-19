import { Link } from "react-router-dom";

const formats = [
  {
    title: "Puzzle Invite",
    text: "Turn your invitation into a playable reveal.",
    path: "/create/puzzle",
    status: "Available"
  },
  {
    title: "Trivia Invite",
    text: "Guests answer a question to unlock the invite.",
    path: "/create/trivia",
    status: "Coming Soon"
  },
  {
    title: "Scratch-Off Invite",
    text: "Scratch to reveal the event details underneath.",
    path: "/create/scratchoff",
    status: "Coming Soon"
  },
  {
    title: "Locked Message Invite",
    text: "Hide your invite behind a simple unlock interaction.",
    path: "/create/locked",
    status: "Coming Soon"
  }
];

export default function CreateLanding() {
  return (
    <div className="page">
      <div className="container">
        <div className="hero">
          <h1>Choose your invite format</h1>
          <p>
            Start with the kind of interactive experience you want to create.
          </p>
        </div>

        <div className="format-grid">
          {formats.map((format) => (
            <div key={format.title} className="format-card">
              <div className="format-status">{format.status}</div>
              <h3>{format.title}</h3>
              <p>{format.text}</p>

              {format.status === "Available" ? (
                <Link to={format.path} className="button">
                  Use this format
                </Link>
              ) : (
                <Link to={format.path} className="button-secondary">
                  Preview page
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
