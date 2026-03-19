export default function PartyTemplate({
  title,
  subtitle,
  message,
  eventDate,
  eventTime,
  eventLocation
}) {
  return (
    <div className="invite-card invite-card-glam-party">
      <div className="glam-lights" />

      <div className="invite-card-inner glam-party-inner">
        <div className="invite-kicker glam-kicker">
          {subtitle || "Celebrate with us"}
        </div>

        <h1>{title || "Join Us For A Party!"}</h1>

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