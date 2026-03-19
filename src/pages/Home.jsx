import { Link } from "react-router-dom";

const unlockTypes = [
  {
    title: "Puzzle Unlock",
    text: "Turn your invite into a playable puzzle reveal."
  },
  {
    title: "Scratch-Off Reveal",
    text: "Let guests scratch to uncover event details and surprises."
  },
  {
    title: "Trivia / Quiz Unlock",
    text: "Make guests answer a question before revealing the invite."
  },
  {
    title: "Locked Message",
    text: "Hide your invite behind a simple unlock interaction."
  }
];

const steps = [
  {
    number: "01",
    title: "Choose an unlock type",
    text: "Pick a format like puzzle, scratch-off, quiz, or reveal."
  },
  {
    number: "02",
    title: "Customize your invite",
    text: "Add your image, message, and event details."
  },
  {
    number: "03",
    title: "Share one link",
    text: "Send it to guests and let them unlock your invite."
  }
];

const examples = [
  "Birthday Invite",
  "Wedding Reveal",
  "Baby Shower",
  "Graduation",
  "Secret Announcement",
  "Promo Giveaway"
];

export default function Home() {
  return (
    <div className="landing-page">
      {/* NAV */}
      <header className="site-nav">
        <div className="site-brand">Playvite</div>

        <nav className="site-nav-links">
          <a href="#unlock-types">Unlock Types</a>
          <a href="#how-it-works">How it works</a>
          <a href="#examples">Examples</a>
        </nav>

        <div className="site-nav-actions">
          <Link to="/create" className="button-secondary">
            View Examples
          </Link>
          <Link to="/create" className="button">
            Create Invite
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="hero-section">
        <div className="hero-copy">
          <div className="hero-badge">Interactive electronic invites</div>

          <h1>Playable invites your guests won’t ignore</h1>

          <p>
            Create interactive invites with puzzles, scratch-offs, quizzes, and
            hidden reveals — all in one shareable link.
          </p>

          <div className="hero-actions">
            <Link to="/create" className="button hero-button">
              Create Invite
            </Link>

            <a href="#unlock-types" className="button-secondary hero-button">
              Explore Formats
            </a>
          </div>

          <div className="hero-meta">
            Shareable links • Interactive reveals • Designed for events,
            announcements, and campaigns
          </div>
        </div>

        {/* HERO VISUAL */}
        <div className="hero-visual">
          <div className="hero-card hero-card-main">
            <div className="mock-window-bar">
              <span />
              <span />
              <span />
            </div>

            <div className="mock-puzzle-grid">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="mock-piece" />
              ))}
            </div>
          </div>

          <div className="hero-card hero-card-floating">
            <div className="mini-label">Unlock Revealed</div>
            <h3>You’re Invited!</h3>
            <p>Saturday • 7:00 PM • 123 Main Street</p>
          </div>
        </div>
      </section>

      {/* UNLOCK TYPES */}
      <section id="unlock-types" className="landing-section">
        <div className="section-heading">
          <h2>Choose how guests unlock your invite</h2>
          <p>
            Pick a format that matches your event, then customize the experience.
          </p>
        </div>

        <div className="feature-grid">
          {unlockTypes.map((item) => (
            <div key={item.title} className="feature-card">
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="landing-section alt-section">
        <div className="section-heading">
          <h2>How it works</h2>
          <p>Create a polished interactive invite in minutes.</p>
        </div>

        <div className="steps-grid">
          {steps.map((step) => (
            <div key={step.number} className="step-card">
              <div className="step-number">{step.number}</div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* EXAMPLES */}
      <section id="examples" className="landing-section">
        <div className="section-heading">
          <h2>Built for every kind of invite</h2>
          <p>
            From celebrations to campaigns, create something people actually
            interact with.
          </p>
        </div>

        <div className="template-grid">
          {examples.map((example) => (
            <div key={example} className="template-card">
              <div className="template-preview" />
              <div className="template-name">{example}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-card">
          <h2>Make your next invite impossible to ignore</h2>
          <p>
            Create an experience your guests will actually open, play, and
            remember.
          </p>

          <Link to="/create" className="button hero-button">
            Start Creating
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="site-footer">
        <p>Brought to you by MAEVE Software Development</p>
      </footer>
    </div>
  );
}
