package controllers

import (
	"VetiCare/entities/dto"
	"VetiCare/services"
	"VetiCare/utils"
	"VetiCare/validators"
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"net/http"
)

type AdminController struct {
	Service *services.AdminService
}

func NewAdminController(s *services.AdminService) *AdminController {
	return &AdminController{Service: s}
}

func (ac *AdminController) RegisterProtectedRoutes(r *mux.Router, mw func(http.Handler) http.Handler) {
	r.Handle("/api/admins", mw(http.HandlerFunc(ac.RegisterAdmin))).Methods("POST")
	r.Handle("/api/admins", mw(http.HandlerFunc(ac.GetAllAdmins))).Methods("GET")
	r.Handle("/api/admins/{id}", mw(http.HandlerFunc(ac.GetAdminByID))).Methods("GET")
	r.Handle("/api/admins/{id}", mw(http.HandlerFunc(ac.UpdateAdmin))).Methods("PUT")
	r.Handle("/api/admins/{id}", mw(http.HandlerFunc(ac.DeleteAdmin))).Methods("DELETE")
	r.Handle("/api/admins/change_password", mw(http.HandlerFunc(ac.ChangePassword))).Methods("POST")
}

func (ac *AdminController) RegisterPublicRoutes(r *mux.Router, registerMW func(http.Handler) http.Handler) {
	r.Handle("/api/admins/register", registerMW(http.HandlerFunc(ac.RegisterAdmin))).Methods("POST")
	r.HandleFunc("/api/admins/login", ac.Login).Methods("POST")
}

func (ac *AdminController) RegisterAdmin(w http.ResponseWriter, r *http.Request) {
	var input dto.AdminRegisterDTO
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	if err := validators.ValidateAdminRegisterDTO(input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	passwordPlain := input.Password
	if passwordPlain == "" {
		passwordPlain = utils.GenerateRandomPassword(8)
	}

	admin, passwordPlain, err := ac.Service.Register(input)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	body := fmt.Sprintf("Hola %s,\n\nTe has registrado correctamente como administrador.\nUsuario: %s\nEmail: %s\nContraseña: %s\n\nSaludos.",
		admin.FullName, admin.Username, admin.Email, passwordPlain)

	go func() {
		if err := utils.SendMail(admin.Email, "Registro exitoso en PetVet - Administrador", body); err != nil {
			fmt.Println("Error al enviar correo al admin:", err)
		}
	}()

	json.NewEncoder(w).Encode(dto.ToAdminDTO(admin))
}

func (ac *AdminController) Login(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Identifier string `json:"identifier"`
		Password   string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}
	admin, err := ac.Service.Login(in.Identifier, in.Password)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	if admin.StatusID != 1 {
		http.Error(w, "Administrador desactivado, no puede iniciar sesión", http.StatusUnauthorized)
		return
	}

	token, err := utils.GenerateJWT(admin.ID.String(), admin.Email)
	if err != nil {
		http.Error(w, "No se pudo generar el token: "+err.Error(), http.StatusInternalServerError)
		return
	}

	resp := map[string]interface{}{
		"admin": dto.ToAdminDTO(admin),
		"token": token,
	}
	json.NewEncoder(w).Encode(resp)
}

func (ac *AdminController) ChangePassword(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Email           string `json:"email"`
		CurrentPassword string `json:"current_password"`
		NewPassword     string `json:"new_password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	if err := validators.ValidateEmail(in.Email); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if in.CurrentPassword == "" {
		http.Error(w, "Contraseña actual es obligatoria", http.StatusBadRequest)
		return
	}
	if err := validators.ValidatePassword(in.NewPassword); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := ac.Service.ChangePassword(in.Email, in.CurrentPassword, in.NewPassword); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Contraseña actualizada correctamente"})
}

func (ac *AdminController) GetAllAdmins(w http.ResponseWriter, _ *http.Request) {
	list, err := ac.Service.GetAll()
	if err != nil {
		http.Error(w, "Error obteniendo administradores: "+err.Error(), http.StatusInternalServerError)
		return
	}
	var dtos []dto.AdminDTO
	for _, admin := range list {
		dtos = append(dtos, dto.ToAdminDTO(&admin))
	}
	json.NewEncoder(w).Encode(dtos)
}

func (ac *AdminController) GetAdminByID(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	admin, err := ac.Service.GetByID(id)
	if err != nil {
		http.Error(w, "Error obteniendo administrador: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if admin == nil {
		http.Error(w, "Administrador no encontrado", http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(dto.ToAdminDTO(admin))
}

func (ac *AdminController) UpdateAdmin(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	var m map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&m); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}
	if fullName, ok := m["full_name"].(string); ok {
		if err := validators.ValidateFullName(fullName); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
	}
	if username, ok := m["username"].(string); ok {
		if err := validators.ValidateUsername(username); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
	}
	if dui, ok := m["dui"].(string); ok {
		if err := validators.ValidateDUI(dui); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
	}
	if phone, ok := m["phone"].(string); ok {
		if err := validators.ValidatePhone(phone); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
	}
	if email, ok := m["email"].(string); ok {
		if err := validators.ValidateEmail(email); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
	}
	if adminTypeID, ok := m["admin_type_id"].(float64); ok { // JSON num es float64
		if err := validators.ValidateAdminTypeID(int(adminTypeID)); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
	}
	if err := ac.Service.Update(id, m); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	admin, err := ac.Service.GetByID(id)
	if err != nil {
		http.Error(w, "Error al obtener administrador actualizado: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if admin == nil {
		http.Error(w, "Administrador no encontrado", http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Administrador actualizado correctamente",
		"admin":   dto.ToAdminDTO(admin),
	})
}

func (ac *AdminController) DeleteAdmin(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	msg, err := ac.Service.Delete(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"message": msg})
}
