import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="column">
      <div className="empty-state">
        <h3>Nothing stamped here</h3>
        <p>That page does not exist.</p>
        <Link to="/" className="btn btn--primary">Back home</Link>
      </div>
    </div>
  );
}
