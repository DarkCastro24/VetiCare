package controllers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"VetiCare/entities"
	"VetiCare/services"
	"github.com/gorilla/mux"
)

type UserRoleController struct {
	Service *services.UserRoleService
}

func NewUserRoleController(service *services.UserRoleService) *UserRoleController {
	return &UserRoleController{Service: service}
}

func (c *UserRoleController) RegisterRoutes(r *mux.Router, mw func(http.Handler) http.Handler) {
	r.Handle("/api/userroles", mw(http.HandlerFunc(c.GetAll))).Methods("GET")
	r.Handle("/api/userroles/{id}", mw(http.HandlerFunc(c.GetByID))).Methods("GET")
	r.Handle("/api/userroles", mw(http.HandlerFunc(c.Create))).Methods("POST")
	r.Handle("/api/userroles/{id}", mw(http.HandlerFunc(c.Update))).Methods("PUT")
	r.Handle("/api/userroles/{id}", mw(http.HandlerFunc(c.Delete))).Methods("DELETE")
}

func (c *UserRoleController) GetAll(w http.ResponseWriter, r *http.Request) {
	list, err := c.Service.GetAll()
	if err != nil {
		http.Error(w, "Error obteniendo roles", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(list)
}

func (c *UserRoleController) GetByID(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])
	role, err := c.Service.GetByID(id)
	if err != nil {
		http.Error(w, "Error obteniendo rol", http.StatusInternalServerError)
		return
	}
	if role == nil {
		http.Error(w, "Rol no encontrado", http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(role)
}

func (c *UserRoleController) Create(w http.ResponseWriter, r *http.Request) {
	var role entities.UserRole
	if err := json.NewDecoder(r.Body).Decode(&role); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}
	if err := c.Service.Create(&role); err != nil {
		http.Error(w, "Error creando rol", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(role)
}

func (c *UserRoleController) Update(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])
	var fields map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&fields); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}
	if err := c.Service.Update(id, fields); err != nil {
		http.Error(w, "Error actualizando rol", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"message": "Rol actualizado correctamente"})
}

func (c *UserRoleController) Delete(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])
	if err := c.Service.Delete(id); err != nil {
		http.Error(w, "Error eliminando rol", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"message": "Rol eliminado correctamente"})
}
