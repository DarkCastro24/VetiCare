package controllers

import (
	"VetiCare/entities/dto"
	"VetiCare/services"
	"VetiCare/validators"
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"net/http"
)

type UserController struct {
	UserService *services.UserService
}

func NewUserController(service *services.UserService) *UserController {
	return &UserController{UserService: service}
}

func (uc *UserController) RegisterRoutes(r *mux.Router, authMiddleware func(http.Handler) http.Handler) {
	// Public Routes
	r.HandleFunc("/api/users/register", uc.Register).Methods("POST")
	r.HandleFunc("/api/users/login", uc.Login).Methods("POST")
	// JWT Routes
	r.Handle("/api/users", authMiddleware(http.HandlerFunc(uc.GetAllUsers))).Methods("GET")
	r.Handle("/api/users", authMiddleware(http.HandlerFunc(uc.Register))).Methods("POST")
	r.Handle("/api/users/owners", authMiddleware(http.HandlerFunc(uc.GetOwners))).Methods("GET")
	r.Handle("/api/users/vets", authMiddleware(http.HandlerFunc(uc.GetVets))).Methods("GET")
	r.Handle("/api/users/{id}", authMiddleware(http.HandlerFunc(uc.GetUserByID))).Methods("GET")
	r.Handle("/api/users/{id}", authMiddleware(http.HandlerFunc(uc.UpdateUser))).Methods("PUT")
	r.Handle("/api/users/{id}", authMiddleware(http.HandlerFunc(uc.DeleteUser))).Methods("DELETE")
	r.Handle("/api/users/change_password", authMiddleware(http.HandlerFunc(uc.ChangePassword))).Methods("POST")
}

func (uc *UserController) Register(w http.ResponseWriter, r *http.Request) {
	var userDTO dto.UserDTO
	if err := json.NewDecoder(r.Body).Decode(&userDTO); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}
	if err := validators.ValidateUserDTO(userDTO); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	// 	Only calls the service to do business logic
	user, err := uc.UserService.Register(&userDTO)
	if err != nil {
		http.Error(w, "El correo o dui ingresados ya estan en uso", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Usuario registrado correctamente",
		"user":    dto.ToUserDTO(user),
	})
}

func (uc *UserController) ChangePassword(w http.ResponseWriter, r *http.Request) {
	type ChangePasswordInput struct {
		Email           string `json:"email"`
		CurrentPassword string `json:"current_password"`
		NewPassword     string `json:"new_password"`
	}
	var input ChangePasswordInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	if err := validators.ValidateEmail(input.Email); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if input.CurrentPassword == "" {
		http.Error(w, "Contraseña actual es obligatoria", http.StatusBadRequest)
		return
	}
	if err := validators.ValidatePassword(input.NewPassword); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err := uc.UserService.ChangePassword(input.Email, input.CurrentPassword, input.NewPassword)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Contraseña actualizada correctamente",
	})
}

func (uc *UserController) Login(w http.ResponseWriter, r *http.Request) {
	var input dto.LoginDTO
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}
	user, token, err := uc.UserService.Login(input)
	if err != nil {
		http.Error(w, "Credenciales inválidas: "+err.Error(), http.StatusUnauthorized)
		return
	}
	if user.StatusID != 1 {
		http.Error(w, "Su usuario esta desactivado, no puede iniciar sesión", http.StatusUnauthorized)
		return
	}
	
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Login exitoso",
		"user":    dto.ToUserDTO(user),
		"token":   token,
	})
}

func (uc *UserController) GetAllUsers(w http.ResponseWriter, _ *http.Request) {
	users, err := uc.UserService.GetAllUsers()
	if err != nil {
		http.Error(w, "Error al obtener usuarios: "+err.Error(), http.StatusInternalServerError)
		return
	}
	var dtos []dto.UserDTO
	for _, user := range users {
		dtos = append(dtos, dto.ToUserDTO(&user))
	}
	json.NewEncoder(w).Encode(dtos)
}

func (uc *UserController) GetOwners(w http.ResponseWriter, _ *http.Request) {
	users, err := uc.UserService.GetUsersByRole(1) // Dueños
	if err != nil {
		http.Error(w, "Error al obtener dueños: "+err.Error(), http.StatusInternalServerError)
		return
	}
	var dtos []dto.UserDTO
	for _, user := range users {
		dtos = append(dtos, dto.ToUserDTO(&user))
	}
	json.NewEncoder(w).Encode(dtos)
}

func (uc *UserController) GetVets(w http.ResponseWriter, _ *http.Request) {
	users, err := uc.UserService.GetUsersByRole(2) // Veterinarios
	if err != nil {
		http.Error(w, "Error al obtener veterinarios: "+err.Error(), http.StatusInternalServerError)
		return
	}
	var dtos []dto.UserDTO
	for _, user := range users {
		dtos = append(dtos, dto.ToUserDTO(&user))
	}
	json.NewEncoder(w).Encode(dtos)
}

func (uc *UserController) GetUserByID(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	user, err := uc.UserService.GetUserByID(id)
	if err != nil {
		http.Error(w, "Error al buscar usuario: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if user == nil {
		http.Error(w, "Usuario no encontrado", http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(dto.ToUserDTO(user))
}

func (uc *UserController) UpdateUser(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	var data map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}
	if len(data) == 0 {
		http.Error(w, "No se enviaron campos para actualizar", http.StatusBadRequest)
		return
	}
	if fullName, ok := data["full_name"].(string); ok {
		if err := validators.ValidateFullName(fullName); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
	}
	if dui, ok := data["dui"].(string); ok {
		if err := validators.ValidateDUI(dui); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
	}
	if phone, ok := data["phone"].(string); ok {
		if err := validators.ValidatePhone(phone); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
	}
	if email, ok := data["email"].(string); ok {
		if err := validators.ValidateEmail(email); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
	}
	if err := uc.UserService.UpdateUser(id, data); err != nil {
		http.Error(w, "Error al actualizar usuario: "+err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{
		"message": fmt.Sprintf("Usuario con ID %s actualizado correctamente", id),
	})
}

func (uc *UserController) DeleteUser(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	msg, err := uc.UserService.DeleteUser(id)
	if err != nil {
		if err.Error() == "usuario no encontrado" {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		http.Error(w, "Error al cambiar estado: "+err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"message": msg})
}
