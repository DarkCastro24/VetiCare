import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import ".././assets/styles/auth.css"; // para estilos unificados

function ForgotPassword() {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await fetch(`${API_URL}/api/users/request-reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      if (!response.ok) {
        const t = await response.text();
        return Swal.fire("Error", t, "error");
      }

      const result = await response.json();

      // ⚠️ Si el backend devuelve token, lo guardamos
      if (result.token) {
        localStorage.setItem("reset_token", result.token);
      }

      Swal.fire(
        "Correo enviado",
        "Si el correo existe, se envió un enlace para restablecer tu contraseña.",
        "success"
      );

      // ⬅️ Ir directo a la pantalla reset
      navigate("/reset-password", { replace: true });

    } catch (err) {
      Swal.fire("Error", "No se pudo procesar la solicitud.", "error");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Recuperar contraseña</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <label>Correo electrónico</label>
          <input
            type="email"
            {...register("email", {
              required: "Este campo es obligatorio",
            })}
          />
          <p className="error">{errors.email?.message}</p>

          <button type="submit" className="auth-button">
            Enviar enlace
          </button>
        </form>

        <button className="auth-link" onClick={() => navigate("/login")}>
          ← Volver al login
        </button>
      </div>
    </div>
  );
}

export default ForgotPassword;
