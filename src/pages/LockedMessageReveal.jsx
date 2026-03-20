import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

import BirthdayTemplate from "../components/templates/BirthdayTemplate.jsx";
import WeddingTemplate from "../components/templates/WeddingTemplate.jsx";
import PartyTemplate from "../components/templates/PartyTemplate.jsx";

function random(min, max) {
  return Math.random() * (max - min) + min;
}

const balloonPalette = [
  { base: "#e11d48", glow: "#fb7185", shadow: "rgba(225, 29, 72, 0.28)" },
  { base: "#db2777", glow: "#f472b6", shadow: "rgba(219, 39, 119, 0.28)" },
  { base: "#7c3aed", glow: "#a78bfa", shadow: "rgba(124, 58, 237, 0.28)" },
  { base: "#2563eb", glow: "#60a5fa", shadow: "rgba(37, 99, 235, 0.28)" },
  { base: "#059669", glow: "#34d399", shadow: "rgba(5, 150, 105, 0.28)" },
  { base: "#ea580c", glow: "#fb923c", shadow: "rgba(234, 88, 12, 0.28)" },
  { base: "#ca8a04", glow: "#facc15", shadow: "rgba(202, 138, 4, 0.28)" }
];

export default function LockedMessageReveal() {
  const { id } = useParams();

  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [poppedIds, setPoppedIds] = useState([]);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    async function fetchInvite() {
      try {
        const ref = doc(db, "puzzles", id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setInvite(snap.data());
        } else {
          setInvite(null);
        }
      } catch (error) {
        console.error("Error loading invite:", error);
        setInvite(null);
      } finally {
        setLoading(false);
      }
    }

    fetchInvite();
  }, [id]);

  const bubbleCount = invite?.bubbleCount || 7;

  const balloons = useMemo(() => {
    return Array.from({ length: bubbleCount }, (_, i) => {
      const color = balloonPalette[i % balloonPalette.length];

      return {
        id: i + 1,
        top: random(18, 72),
        left: random(8, 84),
        width: random(72, 94),
        height: random(112, 148),
        stringHeight: random(68, 105),
        delay: random(0, 2.5),
        duration: random(4.8, 6.4),
        tilt: random(-7, 7),
        sway: random(-7, 7),
        color
      };
    });
  }, [bubbleCount]);

  function handlePop(idToPop) {
    if (poppedIds.includes(idToPop)) return;

    const next = [...poppedIds, idToPop];
    setPoppedIds(next);

    if (next.length === balloons.length) {
      setTimeout(() => {
        setIsUnlocked(true);
      }, 350);
    }
  }

  function renderInvite() {
    if (!invite) return null;

    if (invite.inviteTemplate === "birthday-photo") {
      return (
        <BirthdayTemplate
          title={invite.title}
          subtitle={invite.subtitle}
          message={invite.message}
          eventDate={invite.eventDate}
          eventTime={invite.eventTime}
          eventLocation={invite.eventLocation}
          photo={invite.photo}
          fontFamily={invite.fontFamily}
        />
      );
    }

    if (invite.inviteTemplate === "wedding-elegant") {
      return (
        <WeddingTemplate
          title={invite.title}
          subtitle={invite.subtitle}
          message={invite.message}
          eventDate={invite.eventDate}
          eventTime={invite.eventTime}
          eventLocation={invite.eventLocation}
          nameFontSize={invite.nameFontSize}
          fontFamily={invite.fontFamily}
        />
      );
    }

    return (
      <PartyTemplate
        title={invite.title}
        subtitle={invite.subtitle}
        message={invite.message}
        eventDate={invite.eventDate}
        eventTime={invite.eventTime}
        eventLocation={invite.eventLocation}
        fontFamily={invite.fontFamily}
      />
    );
  }

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="card" style={{ padding: 32 }}>
            Loading invite...
          </div>
        </div>
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="page">
        <div className="container">
          <div className="card" style={{ padding: 32 }}>
            Invite not found.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page locked-page">
      <div className="container">
        <div className="locked-shell">
          <div className="locked-invite">
            {renderInvite()}
          </div>

          {!isUnlocked && (
            <div className="locked-overlay">
              <div className="locked-header">
                <h1>Locked Message</h1>
                <p>Pop all balloons to unlock your invite</p>
                <span>
                  {poppedIds.length} / {balloons.length} popped
                </span>
              </div>

              <div className="locked-playfield">
                {balloons.map((balloon) => {
                  const popped = poppedIds.includes(balloon.id);

                  return (
                    <button
                      key={balloon.id}
                      type="button"
                      className={`balloon ${popped ? "popped" : ""}`}
                      onClick={() => handlePop(balloon.id)}
                      disabled={popped}
                      aria-label="Pop balloon"
                      style={{
                        top: `${balloon.top}%`,
                        left: `${balloon.left}%`,
                        width: `${balloon.width}px`,
                        height: `${balloon.height + balloon.stringHeight}px`,
                        animationDelay: `${balloon.delay}s`,
                        animationDuration: `${balloon.duration}s`,
                        "--balloon-width": `${balloon.width}px`,
                        "--balloon-height": `${balloon.height}px`,
                        "--string-height": `${balloon.stringHeight}px`,
                        "--balloon-rotate": `${balloon.tilt}deg`,
                        "--balloon-sway": `${balloon.sway}px`,
                        "--balloon-base": balloon.color.base,
                        "--balloon-glow": balloon.color.glow,
                        "--balloon-shadow": balloon.color.shadow
                      }}
                    >
                      <span className="balloon-body">
                        <span className="balloon-highlight" />
                        <span className="balloon-highlight-small" />
                      </span>
                      <span className="balloon-string" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}