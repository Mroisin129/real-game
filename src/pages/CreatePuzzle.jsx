import { useRef, useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import html2canvas from "html2canvas";
import { db } from "../firebase";
import BirthdayTemplate from "../components/templates/BirthdayTemplate.jsx";
import WeddingTemplate from "../components/templates/WeddingTemplate.jsx";
import PartyTemplate from "../components/templates/PartyTemplate.jsx";

const inviteTemplates = [
  {
    id: "birthday-photo",
    name: "Playful Birthday",
    description: "Bright, playful, and celebration-focused"
  },
  {
    id: "wedding-elegant",
    name: "Floral Wedding",
    description: "Light, romantic, and elegant"
  },
  {
    id: "party-modern",
    name: "Glam Party",
    description: "Bold, luxe, and evening-event ready"
  }
];

export default function CreatePuzzle() {
  const previewRef = useRef(null);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("You're Invited");
  const [message, setMessage] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [difficulty, setDifficulty] = useState(3);
  const [template, setTemplate] = useState("birthday-photo");
  const [photo, setPhoto] = useState(null);
  const [nameFontSize, setNameFontSize] = useState(2.6);
  const [loading, setLoading] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);

  const difficulties = {
    Easy: 3,
    Medium: 6,
    Hard: 10,
    Insane: 16
  };

  function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  }

  async function handleCopyLink() {
    if (!shareLink) return;

    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
      alert("Could not copy the link.");
    }
  }

  async function captureInviteImage() {
    if (!previewRef.current) return null;

    const canvas = await html2canvas(previewRef.current, {
      backgroundColor: null,
      scale: 2,
      useCORS: true
    });

    return canvas.toDataURL("image/png");
  }

  async function saveInvite() {
    if (!title || !eventDate) {
      alert("Add at least a title and date.");
      return;
    }

    try {
      setLoading(true);
      setShareLink("");
      setCopied(false);

      const inviteImage = await captureInviteImage();

      if (!inviteImage) {
        alert("Could not generate the invite image.");
        return;
      }

      const inviteData = {
        type: "puzzle",
        inviteTemplate: template,
        title,
        subtitle,
        message,
        eventDate,
        eventTime,
        eventLocation,
        photo,
        inviteImage,
        difficulty,
        nameFontSize,
        createdAt: Date.now()
      };

      const docRef = await addDoc(collection(db, "puzzles"), inviteData);
      const link = `${window.location.origin}/puzzle/${docRef.id}`;
      setShareLink(link);
    } catch (error) {
      console.error("Error saving invite:", error);
      alert(`There was a problem saving the invite: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  const selectedTemplate = inviteTemplates.find((t) => t.id === template);

  return (
    <div className="page">
      <div className="container">
        <div className="hero">
          <h1>Create a puzzle invite</h1>
          <p>Design the invite first. Then turn that invite into the puzzle.</p>
        </div>

        <div className="grid-layout">
          <div className="card">
            <h2>Invite settings</h2>

            <div className="field">
              <label className="label">Choose a template</label>
              <div className="template-picker-grid">
                {inviteTemplates.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`invite-template-card ${
                      template === item.id ? "active" : ""
                    }`}
                    onClick={() => setTemplate(item.id)}
                  >
                    <div className="invite-template-name">{item.name}</div>
                    <div className="invite-template-text">
                      {item.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label className="label">Invite title</label>
              <input
                className="input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Emma & Lucas"
              />
            </div>

            <div className="field">
              <label className="label">Invite subtitle</label>
              <input
                className="input"
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Together with their families"
              />
            </div>

            <div className="field">
              <label className="label">Message</label>
              <textarea
                className="textarea"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="request the honour of your presence..."
              />
            </div>

            {template === "birthday-photo" && (
              <div className="field">
                <label className="label">Photo</label>
                <input
                  className="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                />
              </div>
            )}

            {template === "wedding-elegant" && (
              <div className="field">
                <label className="label">Name font size</label>
                <input
                  type="range"
                  min="1.8"
                  max="4.5"
                  step="0.1"
                  value={nameFontSize}
                  onChange={(e) => setNameFontSize(Number(e.target.value))}
                  style={{ width: "100%" }}
                />
                <div className="meta">{nameFontSize.toFixed(1)}rem</div>
              </div>
            )}

            <div className="field">
              <label className="label">Event details</label>
              <input
                className="input"
                type="text"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                placeholder="June 14"
                style={{ marginBottom: 10 }}
              />
              <input
                className="input"
                type="text"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                placeholder="At Five PM"
                style={{ marginBottom: 10 }}
              />
              <input
                className="input"
                type="text"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                placeholder="The Grand Rose Estate"
              />
            </div>

            <div className="field">
              <label className="label">Puzzle difficulty</label>
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
              <button
                type="button"
                className="button"
                onClick={saveInvite}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save & Share Invite"}
              </button>
            </div>

            {shareLink && (
              <div className="share-box">
                <div className="share-label">Share link</div>
                <div className="share-row">
                  <input
                    className="input share-input"
                    type="text"
                    value={shareLink}
                    readOnly
                  />
                  <button
                    type="button"
                    className="button"
                    onClick={handleCopyLink}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <h2>Invite preview</h2>

            <div ref={previewRef} className="invite-preview">
              {template === "birthday-photo" && (
                <BirthdayTemplate
                  title={title}
                  subtitle={subtitle}
                  message={message}
                  eventDate={eventDate}
                  eventTime={eventTime}
                  eventLocation={eventLocation}
                  photo={photo}
                />
              )}

              {template === "wedding-elegant" && (
                <WeddingTemplate
                  title={title}
                  subtitle={subtitle}
                  message={message}
                  eventDate={eventDate}
                  eventTime={eventTime}
                  eventLocation={eventLocation}
                  nameFontSize={nameFontSize}
                />
              )}

              {template === "party-modern" && (
                <PartyTemplate
                  title={title}
                  subtitle={subtitle}
                  message={message}
                  eventDate={eventDate}
                  eventTime={eventTime}
                  eventLocation={eventLocation}
                />
              )}
            </div>

            <div className="meta" style={{ marginTop: 16 }}>
              Template: <strong>{selectedTemplate?.name}</strong>
            </div>
            <div className="meta">
              This rendered invite will be used as the puzzle image.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}