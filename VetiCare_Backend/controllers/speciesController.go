package controllers

import (
	"VetiCare/entities"
	"VetiCare/services"
	"encoding/json"
	"github.com/gorilla/mux"
	"net/http"
	"strconv"
)

type SpeciesController struct {
	Service *services.SpeciesService
}

func NewSpeciesController(service *services.SpeciesService) *SpeciesController {
	return &SpeciesController{Service: service}
}

func (sc *SpeciesController) RegisterRoutes(r *mux.Router, mw func(http.Handler) http.Handler) {
	r.Handle("/api/species", mw(http.HandlerFunc(sc.GetAll))).Methods("GET")
	r.Handle("/api/species/{id}", mw(http.HandlerFunc(sc.GetByID))).Methods("GET")
	r.Handle("/api/species", mw(http.HandlerFunc(sc.Create))).Methods("POST")
	r.Handle("/api/species/{id}", mw(http.HandlerFunc(sc.Update))).Methods("PUT")
	r.Handle("/api/species/{id}", mw(http.HandlerFunc(sc.Delete))).Methods("DELETE")
}

func (sc *SpeciesController) GetAll(w http.ResponseWriter, r *http.Request) {
	list, err := sc.Service.GetAll()
	if err != nil {
		http.Error(w, "Error al obtener especies", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(list)
}

func (sc *SpeciesController) GetByID(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])
	species, err := sc.Service.GetByID(id)
	if err != nil {
		http.Error(w, "Error al obtener especie", http.StatusInternalServerError)
		return
	}
	if species == nil {
		http.Error(w, "Especie no encontrada", http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(species)
}

func (sc *SpeciesController) Create(w http.ResponseWriter, r *http.Request) {
	var species entities.Species
	if err := json.NewDecoder(r.Body).Decode(&species); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}
	if err := sc.Service.Create(&species); err != nil {
		http.Error(w, "Error al crear especie", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(species)
}

func (sc *SpeciesController) Update(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])
	var fields map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&fields); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}
	if err := sc.Service.Update(id, fields); err != nil {
		http.Error(w, "Error al actualizar especie", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"message": "Especie actualizada correctamente"})
}

func (sc *SpeciesController) Delete(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])
	if err := sc.Service.Delete(id); err != nil {
		http.Error(w, "Error al eliminar especie", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"message": "Especie eliminada correctamente"})
}
