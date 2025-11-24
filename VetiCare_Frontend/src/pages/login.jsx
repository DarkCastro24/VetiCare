import Image from "react-bootstrap/Image";
import loginImage from "../assets/images/login/login-image.jpg";
import logoImage from "../assets/images/logoHeader.png";
import React from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

function Login() {
  const API_URL = import.meta.env.VITE_API_URL;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return Swal.fire({
          icon: "error",
          title: "Inicio de sesión fallido",
          text: "Credenciales incorrectas.",
        });
      }

      const result = await response.json();

      localStorage.setItem("token", result.token);
      localStorage.setItem("role_id", result.user.role_id);
      localStorage.setItem("user", JSON.stringify(result.user));
      localStorage.setItem("email", JSON.stringify(result.user.email));
      localStorage.setItem("pf", JSON.stringify(result.user.pf));

      if (result.user.role_id === 1) {
        navigate("/mis_citas", { replace: true });
      } else if (result.user.role_id === 2) {
        navigate("/expediente", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo conectar con el servidor.",
      });
    }
  };

  return (
    <div id="main-container">
      <button
        type="button"
        className="back-top-button"
        onClick={() => navigate("/")}
      >
        ← Regresar
      </button>

      <div id="image-container">
        <Image src={loginImage} fluid width={250} height={100} />
      </div>

      <div id="fields-container">
        <div id="logo-container">
          <Image src={logoImage} fluid width={345} height={200} />
        </div>

        <h4>¡Bienvenido!</h4>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="field-group">
            <label htmlFor="correo">Correo electrónico</label>
            <input
              type="email"
              id="correo"
              {...register("email", {
                required: "El campo correo es requerido",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Ingresa un correo electrónico válido",
                },
              })}
            />
            <p className={`error-message ${errors.email ? "" : "hidden"}`}>
              {errors.email?.message}
            </p>
          </div>

          <div className="field-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              {...register("password", {
                required: "El campo contraseña es requerido",
                minLength: {
                  value: 8,
                  message: "La contraseña debe tener al menos 8 caracteres",
                },
              })}
            />
            <p className={`error-message ${errors.password ? "" : "hidden"}`}>
              {errors.password?.message}
            </p>
          </div>

          <button type="submit">Iniciar Sesión</button>
        </form>

        <div id="register-link">
          <Link to="/register">¿No tienes una cuenta? Regístrate</Link>
        </div>

        <div id="forgot-password-link">
  <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
</div>

      </div>
      

    </div>
  );
}

export default Login;
