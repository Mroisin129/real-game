import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function Create() {
  const [image, setImage] = useState(null);
  const [difficulty, setDifficulty] = useState(3);
  const [title, setTitle] = useState("");
  const [template, setTemplate] = useState("standard");
  const [message, setMessage] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const difficulties = {
    Easy: 3,
    Medium: 6,
    Hard: 10,
    Insane: 16
  };

  function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(file);
  }

  async function savePuzzle() {
    if (!image) {
      alert("Upload an image first");
      return;
    }

    try {
      setLoading(true);

      const puzzleData = {
        title,
        image,
        difficulty,
        template,
        message,
        eventDate,
        eventTime,
        eventLocation,
        createdAt: Date.now()
      };

      const docRef = await addDoc(collection(db, "puzzles"), puzzleData);
      const link = `${window.location.origin}/puzzle/${docRef.id}`;
      alert("Share this link:\n" + link);
    } catch (error) {
      console.error("Error saving puzzle:", error);
      alert("There was a problem saving the puzzle.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className="hero">
          <h1>Turn any photo into a shareable puzzle</h1>
          <p>
            Create invites, secret reveals, announcements, and playable custom
            puzzles in seconds.
          </p>
        </div>

        <div className="grid-layout">
          <div className="card">
            <h2>Create your puzzle</h2>

            <div className="field">
              <label className="label">Puzzle title</label>
              <input
                className="input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Maeve’s Birthday Puzzle"
              />
            </div>

            <div className="field">
              <label className="label">Upload image</label>
              <input
                className="file-input"
                type="file"
                accept="image/*"
                onChange={handleUpload}
              />
            </div>

            <div className="field">
              <label className="label">Puzzle type</label>
              <select
                className="select"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
              >
                <option value="standard">Standard</option>
                <option value="invite">Invite</option>
                <option value="message">Secret Message</option>
                <option value="coupon">Coupon Reveal</option>
                <option value="announcement">Announcement</option>
              </select>
            </div>

            <div className="field">
              <label className="label">Reveal message</label>
              <textarea
                className="textarea"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What should appear after the puzzle is solved?"
              />
            </div>

            {template === "invite" && (
              <div className="field">
                <label className="label">Invite details</label>
                <input
                  className="input"
                  type="text"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  placeholder="April 20, 2026"
                  style={{ marginBottom: 10 }}
                />
                <input
                  className="input"
                  type="text"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  placeholder="7:00 PM"
                  style={{ marginBottom: 10 }}
                />
                <input
                  className="input"
                  type="text"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="123 Main Street"
                />
              </div>
            )}

            <div className="field">
              <label className="label">Difficulty</label>
              <div className="difficulty-grid">
                {Object.entries(difficulties).map(([label, value]) => (
                  <button
                    key={label}
                    type="button"
                    className={`difficulty-chip ${
                      difficulty === value ? "active" : ""
                    }`}
                    onClick={() => setDifficulty(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="meta">
                Selected: {difficulty} × {difficulty}
              </div>
            </div>

            <div className="button-row">
              <button className="button" onClick={savePuzzle} disabled={loading}>
                {loading ? "Saving..." : "Save & Share Puzzle"}
              </button>
            </div>
          </div>

          <div className="card">
            <h2>Live preview</h2>
            <div className="preview-box">
              {image ? (
                <img src={image} alt="Preview" />
              ) : (
                <div className="empty-state">
                  Upload an image to preview your puzzle cover.
                </div>
              )}
            </div>

            <div className="meta" style={{ marginTop: 16 }}>
              Template: <strong>{template}</strong>
            </div>
            <div className="meta">
              Difficulty: <strong>{difficulty} × {difficulty}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
