export default function BirthdayTemplate({
  title,
  subtitle,
  message,
  eventDate,
  eventTime,
  eventLocation
}) {
  return (
    <div className="invite-card invite-card-birthday-clean">
      <div className="birthday-corner birthday-corner-tl" />
      <div className="birthday-corner birthday-corner-tr" />
      <div className="birthday-corner birthday-corner-bl" />
      <div className="birthday-corner birthday-corner-br" />

      <div className="invite-card-inner birthday-clean-inner">
        <div className="invite-kicker birthday-kicker">
          {subtitle || "You're Invited"}
        </div>

        <h1>{title || "Birthday Party!"}</h1>

        {message && <p className="invite-message">{message}</p>}

        <div className="invite-details">
          {eventDate && <div>{eventDate}</div>}
          {eventTime && <div>{eventTime}</div>}
          {eventLocation && <div>{eventLocation}</div>}
        </div>
      </div>
    </div>
  );
}
