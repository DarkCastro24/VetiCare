import { Link, useNavigate } from 'react-router-dom'; 
import Swal from 'sweetalert2';
import "sweetalert2/dist/sweetalert2.min.css";
import { useForm } from 'react-hook-form';

function RequestResetPassword() {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ mode: "onChange" });

    const API_URL = import.meta.env.VITE_API_URL;

    const onSubmit = async (data) => {
        try {
            const response = await fetch(`${API_URL}/api/users/request-reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorText = await response.text();
                await Swal.fire({
                    icon: 'error',
                    title: 'Solicitud fallida',
                    text: errorText || 'Hubo un error al procesar tu solicitud.',
                });
                return;
            }

            await Swal.fire({
                icon: 'success',
                title: 'Solicitud enviada',
                text: 'Si el correo existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña.',
                confirmButtonText: "OK",
            });

            navigate("/login");

        } catch (error) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'No se pudo conectar con el servidor.',
            });
        }
    };

    const styles = {
        container: {
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#ede8dc',
            padding: '2rem',
        },
        card: {
            maxWidth: '400px',
            width: '100%',
            backgroundColor: 'white',
            padding: '2.5rem',
            borderRadius: '30px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
            border: '2px solid #b4855f',
        },
        header: { textAlign: 'center', marginBottom: '1.5rem' },
        title: { fontSize: '2rem', fontWeight: 'bold', color: 'black', marginBottom: '0.5rem' },
        subtitle: { color: '#4a4a4a' },
        backButton: {
            display: 'flex',
            alignItems: 'center',
            marginBottom: '1rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'black',
            fontSize: '1rem',
        },
        input: (hasError) => ({
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            border: `2px solid ${hasError ? 'red' : '#b4855f'}`,
            outline: 'none',
            fontSize: '1rem',
            marginTop: '0.25rem',
            boxSizing: 'border-box',
        }),
        button: {
            width: '100%',
            backgroundColor: '#b4855f',
            color: 'white',
            fontWeight: 'bold',
            padding: '0.75rem 1rem',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            marginTop: '1rem',
            fontSize: '1rem',
        },
        buttonHover: {
            backgroundColor: 'black',
        },
        footer: { textAlign: 'center', marginTop: '1.5rem', color: 'black' },
        link: { color: '#b4855f', textDecoration: 'none', fontWeight: 'bold', marginLeft: '0.25rem' },
        errorText: { color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' },
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <button style={styles.backButton} onClick={() => navigate("/login")}>
                    ← Volver al login
                </button>

                <div style={styles.header}>
                    <h2 style={styles.title}>Recuperar Contraseña</h2>
                    <p style={styles.subtitle}>Te enviaremos la información necesaria para ingresar a tu cuenta</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label htmlFor="email">Correo electrónico</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="correo@ejemplo.com"
                            style={styles.input(errors.email)}
                            {...register("email", {
                                required: "El campo correo es requerido",
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Ingresa un correo electrónico válido",
                                },
                            })}
                        />
                        {errors.email && <p style={styles.errorText}>{errors.email.message}</p>}
                    </div>

                    <button
                        type="submit"
                        style={styles.button}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'black'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#b4855f'}
                    >
                        Confirmar
                    </button>
                </form>
                

                <div style={styles.footer}>
                    <p>
                        ¿Recordaste tu contraseña?
                        <Link to="/login" style={styles.link}>Iniciar sesión</Link>
                    </p>
                    <p>
                        ¿No tienes una cuenta?
                        <Link to="/register" style={styles.link}>Regístrate aquí</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default RequestResetPassword;
