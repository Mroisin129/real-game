import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import BirthdayTemplate from "../components/templates/BirthdayTemplate.jsx";
import WeddingTemplate from "../components/templates/WeddingTemplate.jsx";
import PartyTemplate from "../components/templates/PartyTemplate.jsx";

function getFoilPalette(foilColor) {
  if (foilColor === "gold") {
    return {
      base: "#d7b441",
      shine: "#f7e08a",
      shadow: "#a88617",
      speck: "rgba(255,255,255,0.22)"
    };
  }

  if (foilColor === "rose-gold") {
    return {
      base: "#d89d8e",
      shine: "#f4d0c6",
      shadow: "#b06d63",
      speck: "rgba(255,255,255,0.18)"
    };
  }

  return {
    base: "#bfc3c9",
    shine: "#eef1f4",
    shadow: "#8f98a3",
    speck: "rgba(255,255,255,0.2)"
  };
}

export default function ScratchReveal() {
  const { id } = useParams();
  const canvasRef = useRef(null);
  const inviteBoxRef = useRef(null);
  const confettiRef = useRef(null);
  const scratchCountRef = useRef(0);

  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    async function loadInvite() {
      try {
        const docRef = doc(db, "scratchoffs", id);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          setInvite(snap.data());
        } else {
          setInvite(null);
        }
      } catch (error) {
        console.error("Error loading scratch invite:", error);
        setInvite(null);
      } finally {
        setLoading(false);
      }
    }

    loadInvite();
  }, [id]);

  useEffect(() => {
    if (!invite || !inviteBoxRef.current) return;

    drawScratchLayer();
    drawConfettiCanvas();

    function handleResize() {
      drawScratchLayer();
      drawConfettiCanvas();
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [invite]);

  useEffect(() => {
    if (revealed) {
      fireConfetti();
    }
  }, [revealed]);

  function drawScratchLayer() {
    const canvas = canvasRef.current;
    const inviteBox = inviteBoxRef.current;
    if (!canvas || !inviteBox || !invite) return;

    const rect = inviteBox.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const palette = getFoilPalette(invite.foilColor);

    ctx.clearRect(0, 0, rect.width, rect.height);

    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, palette.shine);
    gradient.addColorStop(0.22, palette.base);
    gradient.addColorStop(0.48, palette.shine);
    gradient.addColorStop(0.72, palette.shadow);
    gradient.addColorStop(1, palette.base);

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);

    for (let i = 0; i < 1400; i += 1) {
      ctx.fillStyle = palette.speck;
      ctx.fillRect(
        Math.random() * rect.width,
        Math.random() * rect.height,
        Math.random() * 2 + 1,
        Math.random() * 2 + 1
      );
    }

    ctx.fillStyle = "rgba(255,255,255,0.16)";
    for (let i = 0; i < 12; i += 1) {
      const y = (rect.height / 12) * i;
      ctx.fillRect(0, y, rect.width, 8);
    }

    ctx.fillStyle = "rgba(255,255,255,0.96)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "700 32px Inter, sans-serif";
    ctx.shadowColor = "rgba(0,0,0,0.14)";
    ctx.shadowBlur = 10;

    ctx.fillText(
      invite.overlayText || "Scratch to reveal",
      rect.width / 2,
      rect.height / 2 - 14
    );

    ctx.font = "500 18px Inter, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.88)";
    ctx.fillText(
      "Use your finger or mouse to uncover the invite",
      rect.width / 2,
      rect.height / 2 + 24
    );

    ctx.shadowBlur = 0;
  }

  function drawConfettiCanvas() {
    const canvas = confettiRef.current;
    const inviteBox = inviteBoxRef.current;
    if (!canvas || !inviteBox) return;

    const rect = inviteBox.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);
  }

  function getPoint(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    if (e.touches && e.touches[0]) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  function scratch(e) {
    if (!isDrawing || revealed) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { x, y } = getPoint(e);

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 38, 0, Math.PI * 2);
    ctx.fill();

    scratchCountRef.current += 1;

    if (scratchCountRef.current % 8 === 0) {
      checkRevealPercent();
    }
  }

  function startScratch(e) {
    e.preventDefault();
    setIsDrawing(true);
    scratch(e);
  }

  function stopScratch() {
    setIsDrawing(false);
  }

  function checkRevealPercent() {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");
  if (!canvas || !ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  const pixels = ctx.getImageData(0, 0, width, height).data;

  let transparentCount = 0;

  for (let i = 3; i < pixels.length; i += 16) {
    if (pixels[i] < 35) transparentCount += 1;
  }

  const totalSampled = pixels.length / 16;
  const percent = transparentCount / totalSampled;

  if (percent > 0.985) {
    setRevealed(true);
    ctx.clearRect(0, 0, width, height);
  }
}

  function fireConfetti() {
    const canvas = confettiRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    const pieces = Array.from({ length: 120 }, () => ({
      x: Math.random() * width,
      y: -20 - Math.random() * height * 0.3,
      size: 6 + Math.random() * 8,
      speedY: 2 + Math.random() * 4,
      speedX: -2 + Math.random() * 4,
      rotation: Math.random() * Math.PI,
      rotationSpeed: -0.2 + Math.random() * 0.4,
      color: ["#f59e0b", "#ec4899", "#8b5cf6", "#10b981", "#3b82f6"][
        Math.floor(Math.random() * 5)
      ]
    }));

    let frameId;

    function animate() {
      ctx.clearRect(0, 0, width, height);

      pieces.forEach((piece) => {
        piece.x += piece.speedX;
        piece.y += piece.speedY;
        piece.rotation += piece.rotationSpeed;

        ctx.save();
        ctx.translate(piece.x, piece.y);
        ctx.rotate(piece.rotation);
        ctx.fillStyle = piece.color;
        ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.65);
        ctx.restore();
      });

      const active = pieces.some((piece) => piece.y < height + 30);

      if (active) {
        frameId = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    }

    animate();

    return () => cancelAnimationFrame(frameId);
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
      <div className="scratch-screen">
        <p>Loading scratch invite...</p>
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="scratch-screen">
        <p>Invite not found.</p>
      </div>
    );
  }

  return (
    <div className="scratch-screen">
      <div className="scratch-stage">
        <div
          ref={inviteBoxRef}
          className={`scratch-invite-box ${revealed ? "revealed" : ""}`}
        >
          <div className={`scratch-invite ${!revealed ? "covered" : ""}`}>
            {renderInvite()}
          </div>

          <canvas
            ref={canvasRef}
            className={`scratch-canvas ${revealed ? "hidden" : ""}`}
            onMouseDown={startScratch}
            onMouseMove={scratch}
            onMouseUp={stopScratch}
            onMouseLeave={stopScratch}
            onTouchStart={startScratch}
            onTouchMove={scratch}
            onTouchEnd={stopScratch}
          />

          <canvas ref={confettiRef} className="confetti-canvas" />
        </div>
      </div>
    </div>
  );
}