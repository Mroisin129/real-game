export default function BirthdayTemplate({
  title,
  subtitle,
  message,
  eventDate,
  eventTime,
  eventLocation,
  photo,
  fontFamily
}) {
  return (
    <div className="birthday-card-shell">
      <div className="birthday-card" style={{ fontFamily: fontFamily || "Inter, sans-serif" }}>
        <div className="birthday-image-block">
          {photo ? (
            <img src={photo} alt="Invite" className="birthday-image" />
          ) : (
            <div className="birthday-placeholder">Upload a photo</div>
          )}
        </div>

        <div className="birthday-text">
          <div className="birthday-sub">
            {subtitle || "You're Invited"}
          </div>

          <h1>{title || "Birthday Celebration"}</h1>

          {message ? <p className="birthday-message">{message}</p> : null}

          <div className="birthday-divider" />

          <div className="birthday-details">
            {eventDate ? <div>{eventDate}</div> : null}
            {eventTime ? <div>{eventTime}</div> : null}
            {eventLocation ? <div>{eventLocation}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}