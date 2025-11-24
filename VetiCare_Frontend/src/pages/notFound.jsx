import { Link } from "react-router-dom";
import "../assets/styles/main.scss";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8fafc",
        textAlign: "center",
        padding: "1rem",
      }}
    >
      <h1
        style={{
          fontSize: "4rem",
          fontWeight: 700,
          color: "#374f59",
          marginBottom: "0.5rem",
        }}
      >
        404
      </h1>

      <p
        style={{
          fontSize: "1.4rem",
          color: "#475569",
          marginBottom: "2rem",
        }}
      >
        La página que buscas no existe o fue removida.
      </p>

      <Link
        to="/"
        style={{
          backgroundColor: "#a5b68d",
          padding: "0.8rem 2rem",
          borderRadius: "2rem",
          fontSize: "1.1rem",
          color: "white",
          textDecoration: "none",
          fontWeight: 600,
          transition: "0.25s ease",
        }}
        onMouseEnter={(e) => (e.target.style.opacity = "0.85")}
        onMouseLeave={(e) => (e.target.style.opacity = "1")}
      >
        Regresar al inicio
      </Link>
    </div>
  );
}
