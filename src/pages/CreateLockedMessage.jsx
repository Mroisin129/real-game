import { useRef, useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import BirthdayTemplate from "../components/templates/BirthdayTemplate.jsx";
import WeddingTemplate from "../components/templates/WeddingTemplate.jsx";
import PartyTemplate from "../components/templates/PartyTemplate.jsx";

const inviteTemplates = [
  {
    id: "birthday-photo",
    name: "Create your own",
    description: "Use your own image"
  },
  {
    id: "wedding-elegant",
    name: "Wedding",
    description: "Romantic"
  },
  {
    id: "party-modern",
    name: "Party",
    description: "Party"
  }
];

const fontOptions = [
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Playfair Display", value: "'Playfair Display', serif" },
  { label: "Montserrat", value: "'Montserrat', sans-serif" },
  { label: "Cormorant Garamond", value: "'Cormorant Garamond', serif" }
];

const bubbleCountOptions = [
  { label: "Easy", value: 10 },
  { label: "Medium", value: 15 },
  { label: "Hard", value: 25},
];

export default function CreateLockedMessage() {
  const previewRef = useRef(null);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("You're Invited");
  const [message, setMessage] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [template, setTemplate] = useState("birthday-photo");
  const [photo, setPhoto] = useState(null);
  const [nameFontSize, setNameFontSize] = useState(2.6);
  const [fontFamily, setFontFamily] = useState("Inter, sans-serif");
  const [bubbleCount, setBubbleCount] = useState(7);
  const [loading, setLoading] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);

  function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        const maxWidth = 1200;
        const scale = Math.min(1, maxWidth / img.width);

        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressed = canvas.toDataURL("image/jpeg", 0.82);
        setPhoto(compressed);
      };

      img.src = reader.result;
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

  function renderPreview() {
    if (template === "birthday-photo") {
      return (
        <BirthdayTemplate
          title={title}
          subtitle={subtitle}
          message={message}
          eventDate={eventDate}
          eventTime={eventTime}
          eventLocation={eventLocation}
          photo={photo}
          fontFamily={fontFamily}
        />
      );
    }

    if (template === "wedding-elegant") {
      return (
        <WeddingTemplate
          title={title}
          subtitle={subtitle}
          message={message}
          eventDate={eventDate}
          eventTime={eventTime}
          eventLocation={eventLocation}
          nameFontSize={nameFontSize}
          fontFamily={fontFamily}
        />
      );
    }

    return (
      <PartyTemplate
        title={title}
        subtitle={subtitle}
        message={message}
        eventDate={eventDate}
        eventTime={eventTime}
        eventLocation={eventLocation}
        fontFamily={fontFamily}
      />
    );
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

      const inviteData = {
        type: "locked",
        unlockMode: "tap-to-burst",
        inviteTemplate: template,
        title,
        subtitle,
        message,
        eventDate,
        eventTime,
        eventLocation,
        bubbleCount,
        nameFontSize,
        fontFamily: fontFamily || "Inter, sans-serif",
        createdAt: Date.now()
      };

      if (template === "birthday-photo" && photo) {
        inviteData.photo = photo;
      }

      const docRef = await addDoc(collection(db, "puzzles"), inviteData);
      const link = `${window.location.origin}/locked/${docRef.id}`;
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
        <div className="hero hero-compact">
          <h1>Create a locked invite</h1>
          <p>Build the invite, choose the tap-to-burst unlock, and share the reveal link.</p>
        </div>

        <div className="grid-layout create-editor-layout">
          <div className="card create-sidebar">
            <div className="create-section">
              <h2>Invite settings</h2>
              <p className="meta create-section-meta">
                Customize the design, details, and locked reveal experience.
              </p>
            </div>

            <div className="field">
              <label className="label">Choose a template</label>
              <div className="template-picker-grid compact-template-grid">
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
                    <div className="invite-template-text">{item.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label className="label">Unlock style</label>
              <div className="meta" style={{ marginBottom: 10 }}>
                Tap-to-Burst
              </div>
              <div className="share-box" style={{ padding: "12px 14px" }}>
                Pop all balloons to reveal the invitation.
              </div>
            </div>

            <div className="field">
              <label className="label">Number of balloons</label>
              <div className="difficulty-grid">
                {bubbleCountOptions.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    className={`difficulty-chip ${
                      bubbleCount === item.value ? "active" : ""
                    }`}
                    onClick={() => setBubbleCount(item.value)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="meta">Selected: {bubbleCount} balloons</div>
            </div>

            <div className="field">
              <label className="label">Font</label>
              <select
                className="select"
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
              >
                {fontOptions.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
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
                className="textarea compact-textarea"
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

              <div className="two-column-fields" style={{ marginBottom: 10 }}>
                <input
                  className="input"
                  type="text"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  placeholder="June 14"
                />
                <input
                  className="input"
                  type="text"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  placeholder="At Five PM"
                />
              </div>

              <input
                className="input"
                type="text"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                placeholder="The Grand Rose Estate"
              />
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

          <div className="card create-preview-card">
            <div className="create-section">
              <h2>Live preview</h2>
              <p className="meta create-section-meta">
                This is the invite your guest will reveal after popping all balloons.
              </p>
            </div>

            <div ref={previewRef} className="invite-preview compact-invite-preview">
              {renderPreview()}
            </div>

            <div className="meta" style={{ marginTop: 14 }}>
              Template: <strong>{selectedTemplate?.name}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
