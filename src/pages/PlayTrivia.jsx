import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import confetti from "canvas-confetti";
import { db } from "../firebase";
import BirthdayTemplate from "../components/templates/BirthdayTemplate.jsx";
import WeddingTemplate from "../components/templates/WeddingTemplate.jsx";
import PartyTemplate from "../components/templates/PartyTemplate.jsx";

export default function PlayTrivia() {
  const { id } = useParams();

  const [inviteData, setInviteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [answerInput, setAnswerInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [answerError, setAnswerError] = useState("");

  useEffect(() => {
    async function loadInvite() {
      try {
        setLoading(true);
        setError("");

        const docRef = doc(db, "triviaInvites", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setError("Invite not found.");
          setInviteData(null);
          return;
        }

        setInviteData(docSnap.data());
      } catch (err) {
        console.error("Error loading trivia invite:", err);
        setError("Could not load this invite.");
        setInviteData(null);
      } finally {
        setLoading(false);
      }
    }

    loadInvite();
  }, [id]);

  function normalizeAnswer(value) {
    return String(value || "")
      .trim()
      .toLowerCase();
  }

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

  function handleUnlock() {
    if (!inviteData) return;

    const correctAnswer = normalizeAnswer(inviteData.triviaAnswer);
    const submittedAnswer = normalizeAnswer(answerInput);

    if (!submittedAnswer) {
      setAnswerError("Please enter an answer.");
      return;
    }

    if (submittedAnswer === correctAnswer) {
      setUnlocked(true);
      setAnswerError("");
      fireConfetti();
      return;
    }

    setAnswerError("That answer is not correct. Try again.");
  }

  function renderInvite() {
    if (!inviteData) return null;

    if (inviteData.inviteTemplate === "birthday-photo") {
      return (
        <BirthdayTemplate
          title={inviteData.title}
          subtitle={inviteData.subtitle}
          message={inviteData.message}
          eventDate={inviteData.eventDate}
          eventTime={inviteData.eventTime}
          eventLocation={inviteData.eventLocation}
          photo={inviteData.photo}
        />
      );
    }

    if (inviteData.inviteTemplate === "wedding-elegant") {
      return (
        <WeddingTemplate
          title={inviteData.title}
          subtitle={inviteData.subtitle}
          message={inviteData.message}
          eventDate={inviteData.eventDate}
          eventTime={inviteData.eventTime}
          eventLocation={inviteData.eventLocation}
          nameFontSize={inviteData.nameFontSize}
        />
      );
    }

    if (inviteData.inviteTemplate === "party-modern") {
      return (
        <PartyTemplate
          title={inviteData.title}
          subtitle={inviteData.subtitle}
          message={inviteData.message}
          eventDate={inviteData.eventDate}
          eventTime={inviteData.eventTime}
          eventLocation={inviteData.eventLocation}
        />
      );
    }

    return <div className="card">Unknown template.</div>;
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

  if (error || !inviteData) {
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

  return (
    <div className="page play-page">
      <div className="container play-shell">
        <div className="hero hero-compact">
          <h1>{unlocked ? "Invite Unlocked" : inviteData.title || "You’re Invited"}</h1>
          <p>
            {unlocked
              ? "You answered correctly."
              : "Answer the trivia question correctly to unlock the invitation."}
          </p>
        </div>

        {!unlocked && (
          <div
            className="card"
            style={{
              maxWidth: 720,
              margin: "0 auto"
            }}
          >
            <div className="create-section">
              <h2>Trivia question</h2>
              <p className="meta create-section-meta">
                Enter the correct answer to reveal the invite.
              </p>
            </div>

            <div className="field">
              <label className="label">Question</label>
              <div
                className="input"
                style={{
                  minHeight: 56,
                  display: "flex",
                  alignItems: "center",
                  background: "#f8fafc",
                  fontWeight: 600
                }}
              >
                {inviteData.triviaQuestion || "No question provided."}
              </div>
            </div>

            <div className="field">
              <label className="label">Your answer</label>
              <input
                className="input"
                type="text"
                value={answerInput}
                onChange={(e) => {
                  setAnswerInput(e.target.value);
                  if (answerError) setAnswerError("");
                }}
                placeholder="Type your answer"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleUnlock();
                  }
                }}
              />
            </div>

            {answerError && (
              <div
                className="meta"
                style={{
                  color: "#dc2626",
                  marginTop: -4,
                  marginBottom: 14,
                  fontWeight: 600
                }}
              >
                {answerError}
              </div>
            )}

            <div className="button-row">
              <button
                type="button"
                className="button"
                onClick={handleUnlock}
              >
                Unlock Invite
              </button>
            </div>
          </div>
        )}

        {unlocked && (
          <div className="card">
            {renderInvite()}
          </div>
        )}
      </div>
    </div>
  );
}
