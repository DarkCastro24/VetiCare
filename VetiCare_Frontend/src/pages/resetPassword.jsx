import { useForm } from "react-hook-form";
import { useSearchParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../assets/styles/auth.css";

function ResetPassword() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const tokenFromURL = params.get("token");
  const tokenFromStorage = localStorage.getItem("reset_token");

  const token = tokenFromURL || tokenFromStorage;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await fetch(`${API_URL}/api/users/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: data.token,
          newPassword: data.newPassword,
        }),
      });

      if (!response.ok) {
        const t = await response.text();
        return Swal.fire("Error", t, "error");
      }

      Swal.fire("Contraseña actualizada", "Ahora puedes iniciar sesión", "success")
        .then(() => {
          localStorage.removeItem("reset_token");
          navigate("/login");
        });

    } catch (err) {
      Swal.fire("Error", "No se pudo actualizar la contraseña.", "error");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Restablecer contraseña</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <label>Token de recuperación</label>
          <input
            type="text"
            defaultValue={token || ""}
            {...register("token", { required: "El token es obligatorio" })}
          />
          <p className="error">{errors.token?.message}</p>

          <label>Nueva contraseña</label>
          <input
            type="password"
            {...register("newPassword", {
              required: "Campo obligatorio",
              minLength: {
                value: 8,
                message: "Debe tener al menos 8 caracteres",
              },
            })}
          />
          <p className="error">{errors.newPassword?.message}</p>

          <button type="submit" className="auth-button">
            Cambiar contraseña
          </button>
        </form>

        <button className="auth-link" onClick={() => navigate("/login")}>
          ← Volver al login
        </button>
      </div>
    </div>
  );
}

export default ResetPassword;
