## Archivo .ENV para el backend 
DATABASE_URL=postgres://postgres:2002@localhost:5432/veticare?sslmode=disable
EMAIL_FROM=petvet461@gmail.com
EMAIL_PASS=jsjcwxcthzfqooji
JWT_KEY=a4e413f2fd0624bb8e68d02d1909799d
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=2002 // Cambiar por su clave de Postgres
DB_NAME=veticare

## Archivo .ENV para el frontend
VITE_API_URL=http://localhost:8080
VITE_ADMIN_SECRET=4ba29b9f9e5732ed33761840f4ba6c53
API_DEPLOY=https://petvet-production.up.railway.app
