import floral from "../../assets/floral-invite.png";

export default function WeddingTemplate({
  title,
  message,
  eventDate,
  eventTime,
  eventLocation,
  nameFontSize = 2.6
}) {
  return (
    <div className="invite-card invite-card-wedding-real">
      {/* Background */}
      <img src={floral} alt="" className="wedding-bg" />

      {/* Overlay */}
      <div className="wedding-overlay">
        <p className="wedding-top">
          {message ||
            "You are warmly invited to celebrate the marriage of"}
        </p>

        <h1
          className="wedding-names"
          style={{ fontSize: `${nameFontSize}rem` }}
        >
          {title || "Emma & Lucas"}
        </h1>

        {/* Date + Time */}
        <div className="wedding-date-block">
          {eventDate && <div className="wedding-date">{eventDate}</div>}
          {eventTime && <div className="wedding-time">{eventTime}</div>}
        </div>

        {/* Location */}
        {eventLocation && (
          <div className="wedding-location">{eventLocation}</div>
        )}
      </div>
    </div>
  );
}