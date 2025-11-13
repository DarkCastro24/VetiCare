package controllers

import (
	"VetiCare/entities"
	"VetiCare/services"
	"encoding/json"
	"github.com/gorilla/mux"
	"net/http"
	"strconv"
)

type AdminTypeController struct {
	Service *services.AdminTypeService
}

func NewAdminTypeController(service *services.AdminTypeService) *AdminTypeController {
	return &AdminTypeController{Service: service}
}

func (atc *AdminTypeController) RegisterRoutes(r *mux.Router, mw func(http.Handler) http.Handler) {
	r.Handle("/api/admintypes", mw(http.HandlerFunc(atc.GetAll))).Methods("GET")
	r.Handle("/api/admintypes/{id}", mw(http.HandlerFunc(atc.GetByID))).Methods("GET")
	r.Handle("/api/admintypes", mw(http.HandlerFunc(atc.Create))).Methods("POST")
	r.Handle("/api/admintypes/{id}", mw(http.HandlerFunc(atc.Update))).Methods("PUT")
	r.Handle("/api/admintypes/{id}", mw(http.HandlerFunc(atc.Delete))).Methods("DELETE")
}

func (atc *AdminTypeController) GetAll(w http.ResponseWriter, _ *http.Request) {
	list, err := atc.Service.GetAll()
	if err != nil {
		http.Error(w, "Error al obtener los tipos de administrador", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(list)
}

func (atc *AdminTypeController) GetByID(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])
	at, err := atc.Service.GetByID(id)
	if err != nil {
		http.Error(w, "Error al obtener tipo", http.StatusInternalServerError)
		return
	}
	if at == nil {
		http.Error(w, "Tipo no encontrado", http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(at)
}

func (atc *AdminTypeController) Create(w http.ResponseWriter, r *http.Request) {
	var at entities.AdminType
	if err := json.NewDecoder(r.Body).Decode(&at); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}
	if err := atc.Service.Create(&at); err != nil {
		http.Error(w, "Error al crear tipo", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(at)
}

func (atc *AdminTypeController) Update(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])
	var fields map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&fields); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}
	if err := atc.Service.Update(id, fields); err != nil {
		http.Error(w, "Error al actualizar tipo", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"message": "Tipo actualizado correctamente"})
}

func (atc *AdminTypeController) Delete(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])
	if err := atc.Service.Delete(id); err != nil {
		http.Error(w, "Error al eliminar tipo", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"message": "Tipo eliminado correctamente"})
}
