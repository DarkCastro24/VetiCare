import Image from 'react-bootstrap/Image';
import registerImage from "../assets/images/register/registerDog.jpg";
import logoImage from "../assets/images/logoHeader.png";
import { Link } from 'react-router-dom';

import Swal from 'sweetalert2';
import "sweetalert2/dist/sweetalert2.min.css";

import { useForm } from 'react-hook-form';
function Register() {

    const { register, handleSubmit, formState: { errors } } = useForm();
    const API_URL = import.meta.env.VITE_API_URL;


    const onSubmit = async (data) => {
        try {
            const userData = { ...data, role_id: 1 }

            console.log("Enviando datos:", userData);
            const response = await fetch(`${API_URL}/api/users/register`, {

                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',

                },
                body: JSON.stringify(userData),
            },

            )
            if (!response.ok) {
                const errorText = await response.text();
                return Swal.fire({
                    icon: 'error',
                    title: 'Register fallido',
                    text: errorText,
                });
            }

            if (response.ok) {
                console.log(response.status);
            }


            const result = await response.json();
            console.log("The result is", result)

        } catch (error) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'No se pudo conectar con el servidor.',
            });
        }

    }

    return (
        <div id="main-container-register">
            <div id='image-container-register'>
                <Image src={registerImage} fluid width={250} height={100} />
            </div>

            <div id='fields-container-register'>
                <div id='logo-container-register'>
                    <Image src={logoImage} fluid width={345} height={200} />

                </div>

                <h4 >Rellena los siguientes campos</h4>


                <form action="submit" onSubmit={handleSubmit(onSubmit)}>


                    <label htmlFor="name">Nombre completo</label>
                    <input type="text" id="name" {...register("full_name", { required: "El campo nombre es requerido" })} />
                    {errors.FullName && <p>{errors.FullName.message}</p>}

                    <label htmlFor="dui"> DUI</label>
                    <input type="text" id="dui"  {...register("dui", { required: "El campo DUI es requerido" })} />
                    {errors.DUI && <p>{errors.DUI.message}</p>}

                    <label htmlFor="telephone"> Telefóno</label>
                    <input type="tel" id="telephone"  {...register("phone", { required: "El campo telefóno es requerido" })} />
                    {errors.Phone && <p>{errors.Phone.message}</p>}


                    <label htmlFor="email"> Correo electrónico</label>
                    <input type="email" id="email"  {...register("email", { required: "El campo correo es requerido" })} />
                    {errors.Email && <p>{errors.Email.message}</p>}

                    <label htmlFor="password"> Contraseña</label>
                    <input type="password" id="password"  {...register("password_hash", { required: "El campo contraseña es requerido" })} />
                    {errors.passwordPlain && <p>{errors.passwordPlain.message}</p>}

                    <button type='submit'>
                        Registrarse
                    </button>



                </form>
                <div id='signin-link-register'>
                    <Link to="/login">¿Ya tienes una cuenta? Iniciar sesión</Link>
                </div>

            </div>




        </div>
    )
}

export default Register