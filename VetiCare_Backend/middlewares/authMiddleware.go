package middlewares

import (
	"VetiCare/utils"
	"bytes"
	"io"
	"net/http"
	"strings"
)

const AdminSecretKey = "4ba29b9f9e5732ed33761840f4ba6c53"

func JWTAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		authHeader := r.Header.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			http.Error(w, "Token no proporcionado", http.StatusUnauthorized)
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := utils.ValidateJWT(tokenStr)
		if err != nil {
			http.Error(w, "Token inválido o expirado", http.StatusUnauthorized)
			return
		}

		r.Header.Set("User-ID", claims.UserID)

		next.ServeHTTP(w, r)
	})
}

func AdminSecretKeyMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("X-Admin-Secret") != AdminSecretKey {
			http.Error(w, "Clave secreta inválida", http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func AdminProtected(next http.Handler) http.Handler {
	return JWTAuthMiddleware(AdminSecretKeyMiddleware(next))
}

func AdminRegisterMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		if r.Body != nil {
			bodyBytes, _ := io.ReadAll(r.Body)
			r.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))
		}

		next.ServeHTTP(w, r)
	})
}
