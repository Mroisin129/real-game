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
    <div style={{ padding: 20, maxWidth: 700, margin: "0 auto" }}>
      <h1>Create Puzzle</h1>

      <div style={{ marginBottom: 16 }}>
        <label>Puzzle title</label>
        <br />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a title"
          style={{ width: "100%", padding: 10, marginTop: 6 }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label>Upload image</label>
        <br />
        <input type="file" accept="image/*" onChange={handleUpload} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label>Choose template</label>
        <br />
        <select
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          style={{ width: "100%", padding: 10, marginTop: 6 }}
        >
          <option value="standard">Standard</option>
          <option value="invite">Invite</option>
          <option value="message">Secret Message</option>
          <option value="coupon">Coupon Reveal</option>
          <option value="announcement">Announcement</option>
        </select>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label>Reveal message</label>
        <br />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What should appear after the puzzle is solved?"
          rows={4}
          style={{ width: "100%", padding: 10, marginTop: 6 }}
        />
      </div>

      {template === "invite" && (
        <div style={{ marginBottom: 16 }}>
          <h3>Invite details</h3>

          <input
            type="text"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            placeholder="Event date"
            style={{ width: "100%", padding: 10, marginBottom: 10 }}
          />

          <input
            type="text"
            value={eventTime}
            onChange={(e) => setEventTime(e.target.value)}
            placeholder="Event time"
            style={{ width: "100%", padding: 10, marginBottom: 10 }}
          />

          <input
            type="text"
            value={eventLocation}
            onChange={(e) => setEventLocation(e.target.value)}
            placeholder="Event location"
            style={{ width: "100%", padding: 10 }}
          />
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <label>Select difficulty</label>
        <div style={{ marginTop: 8 }}>
          {Object.entries(difficulties).map(([label, value]) => (
            <button
              key={label}
              type="button"
              onClick={() => setDifficulty(value)}
              style={{
                marginRight: 8,
                marginBottom: 8,
                padding: "10px 14px",
                background: difficulty === value ? "#222" : "#ddd",
                color: difficulty === value ? "#fff" : "#000",
                border: "none",
                borderRadius: 6,
                cursor: "pointer"
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <p>
          Selected: {difficulty} x {difficulty}
        </p>
      </div>

      {image && (
        <div style={{ marginBottom: 20 }}>
          <h3>Preview</h3>
          <img
            src={image}
            alt="preview"
            style={{ maxWidth: 250, borderRadius: 8 }}
          />
        </div>
      )}

      <button
        onClick={savePuzzle}
        disabled={loading}
        style={{
          padding: "12px 18px",
          border: "none",
          borderRadius: 8,
          cursor: "pointer"
        }}
      >
        {loading ? "Saving..." : "Save and Share Puzzle"}
      </button>
    </div>
  );
}
