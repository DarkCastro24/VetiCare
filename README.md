# DOCUMENTACION DEL PROYECTO VETICARE

## 1. Descripcion del proyecto

*VetiCare* es un sistema web diseñado para gestionar de manera eficiente las actividades realizadas en una clínica veterinaria. Su objetivo es facilitar la administración de citas, el registro de mascotas, la gestión de veterinarios y proporcionar acceso rápido a la información crítica tanto para los dueños de mascotas como para los veterinarios.

### Funciones de los tipos de usuarios de VetiCare

1. *Dueños de mascotas:*
   - Registro y gestión de sus mascotas.
   - Acceso al historial médico de cada mascota.
   - Agendar y consultar citas veterinarias.

2. *Veterinarios:*
   - Visualización del listado de citas programadas.
   - Actualización de diagnósticos y notas médicas.
   - Consultas de expedientes médicos de las mascotas.

3. *Administradores:*
   - Supervisión general del funcionamiento del sistema.
   - Acceso a estadísticas y comportamiento dentro de la plataforma.
   - Administración de usuarios.

### Objetivo del Sistema

VetiCare está diseñado para ser una plataforma intuitiva y fácil de usar, con el objetivo de mejorar la productividad y satisfacción de los usuarios. Su interfaz moderna y organizada facilita el acceso rápido a la información y herramientas, permitiendo a propietarios de mascotas y veterinarios gestionar sus tareas diarias de manera más eficiente.

---

## 2. Requisitos Previos del Sistema

Para ejecutar correctamente este proyecto, se requieren los siguientes elementos:

- *Go* 1.23 o superior
- *Node* 20 o superior
- *PostgreSQL* instalado y con la base VetiCare creada
- *Git* para clonar el repositorio
- *npm* para instalar las dependencias del frontend

---

## 3. Instalacion General

### Backend

1. Accede a la carpeta del backend.
2. Crea el archivo .env basado en este documento.
3. Agrega las credenciales de la base de datos, correo y clave JWT.
4. Ejecuta el siguiente comando para instalar las dependencias:
   bash
   go mod tidy

### Frontend

1. Accede a la carpeta del frontend.
2. Instala las dependencias con:
   bash
   npm install
   
3. Crea el archivo .env basado en este documento.
4. Configura las URLs del backend en el archivo .env.

---

## 4. Ejecución del sistema (Local)

### Backend

Para ejecutar el backend, utiliza el siguiente comando:

```bash
go run main.go
```

### Frontend

Para ejecutar el frontend en modo desarrollo, usa:

```bash
npm run dev
```

## 4.1. Docker Compose (Contenedor)

Para levantar el contenedor con todo el sistema, ejecuta:

```bash
docker-compose up --build
```

---

## 5. Variables de entorno del frontend (.env.example)

Las siguientes variables deben ser configuradas en el archivo .env del frontend:

- *VITE_API_URL*: Direccion base del backend en entorno local.
- *VITE_ADMIN_SECRET*: Clave privada para validaciones internas del frontend.
- *VITE_API_DEPLOY*: URL del backend en producción (Railway).

---

## 6. Variables de entorno del backend (.env.example)

Las siguientes variables deben ser configuradas en el archivo .env del backend:

- *DATABASE_URL*: Cadena de conexion completa a PostgreSQL.
- *EMAIL_FROM*: Correo electronico desde el cual se enviaran notificaciones o alertas.
- *EMAIL_PASS*: Contraseña o App Password asociada al correo configurado.
- *JWT_KEY*: Clave secreta para la firma de tokens JWT.
- *DB_HOST*: Host donde se encuentra PostgreSQL.
- *DB_PORT*: Puerto donde opera PostgreSQL.
- *DB_USER*: Usuario de la base de datos.
- *DB_PASS*: Contraseña del usuario de la base de datos.
- *DB_NAME*: Nombre de la base de datos utilizada por el backend.
- *FRONTEND_URL*: Direccion base del frontend 