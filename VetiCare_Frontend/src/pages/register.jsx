import Image from 'react-bootstrap/Image';
import registerImage from "../assets/images/register/registerDog.jpg";
import logoImage from "../assets/images/logoHeader.png";
import { Link, useNavigate } from 'react-router-dom';



import Swal from 'sweetalert2';
import "sweetalert2/dist/sweetalert2.min.css";

import { useForm } from 'react-hook-form';


function Register() {

    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        mode: "onChange",
    });

    const API_URL = import.meta.env.VITE_API_URL;

    const onSubmit = async (data) => {
    try {
        const userData = { ...data, role_id: 1 };

        console.log("Enviando datos:", userData);
        const response = await fetch(`${API_URL}/api/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            await Swal.fire({
                icon: 'error',
                title: 'Registro fallido',
                text: errorText || 'Hubo un error en el registro.',
            });
            return;
        }

        const result = await response.json();
        console.log("The result is", result);

        const swalResult = await Swal.fire({
            icon: 'success',
            title: 'Registro exitoso',
            text: 'Tu cuenta ha sido creada correctamente.',
            confirmButtonText: "OK",
        });

        // 👇 Aquí ya es la respuesta del Swal, no la del backend
        if (swalResult.isConfirmed) {
            navigate("/"); // o "/login" si quieres ir al login
        }

    } catch (error) {
        await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'No se pudo conectar con el servidor.',
        });
    }
};
    return (
        <div id="main-container-register">
            <div id='image-container-register'>
                <Image src={registerImage} fluid width={250} height={100} />
            </div>

            <div id='fields-container-register'>
                <div id='logo-container-register'>
                    <Image src={logoImage} fluid width={345} height={200} />
                </div>

                <h4>Rellena los siguientes campos</h4>

                <form onSubmit={handleSubmit(onSubmit)} noValidate>

                    {/* NOMBRE COMPLETO */}
                    <div className="field-group">
                        <label htmlFor="name">Nombre completo</label>
                        <input
                            type="text"
                            id="name"
                            {...register("full_name", {
                                required: "El campo nombre es requerido",
                                pattern: {
                                    value: /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/,
                                    message: "El nombre solo puede contener letras y espacios",
                                },
                                minLength: {
                                    value: 3,
                                    message: "El nombre debe tener al menos 3 caracteres",
                                },
                            })}
                        />
                        <p className="error-message">
                            {errors.full_name?.message || "\u00A0"}
                        </p>
                    </div>

                    {/* DUI */}
                    <div className="field-group">
                        <label htmlFor="dui">DUI</label>
                        <input
                            type="text"
                            id="dui"
                            {...register("dui", {
                                required: "El campo DUI es requerido",
                                pattern: {
                                    // Ejemplo 00000000-0
                                    value: /^[0-9]{8}-[0-9]{1}$/,
                                    message: "El DUI debe tener el formato 00000000-0",
                                },
                            })}
                        />
                        <p className="error-message">
                            {errors.dui?.message || "\u00A0"}
                        </p>
                    </div>

                    {/* TELÉFONO */}
                    <div className="field-group">
                        <label htmlFor="telephone">Teléfono</label>
                        <input
                            type="tel"
                            id="telephone"
                            {...register("phone", {
                                required: "El campo teléfono es requerido",
                                pattern: {
                                    value: /^[0-9]{4}-[0-9]{4}$/,
                                    message: "El teléfono debe tener el formato 0000-0000",
                                },
                            })}
                        />
                        <p className="error-message">
                            {errors.phone?.message || "\u00A0"}
                        </p>
                    </div>

                    {/* CORREO ELECTRÓNICO */}
                    <div className="field-group">
                        <label htmlFor="email">Correo electrónico</label>
                        <input
                            type="email"
                            id="email"
                            {...register("email", {
                                required: "El campo correo es requerido",
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Ingresa un correo electrónico válido",
                                },
                            })}
                        />
                        <p className="error-message">
                            {errors.email?.message || "\u00A0"}
                        </p>
                    </div>

                    {/* CONTRASEÑA */}
                    <div className="field-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            {...register("password_hash", {
                                required: "El campo contraseña es requerido",
                                minLength: {
                                    value: 8,
                                    message: "La contraseña debe tener al menos 8 caracteres",
                                },
                            })}
                        />
                        <p className="error-message">
                            {errors.password_hash?.message || "\u00A0"}
                        </p>
                    </div>

                    <button type='submit'>
                        Registrarse
                    </button>
                </form>

                <div id='signin-link-register'>
                    <Link to="/login">¿Ya tienes una cuenta? Iniciar sesión</Link>
                </div>
            </div>
        </div>
    );
}

export default Register;
