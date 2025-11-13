package controllers

import (
	"VetiCare/entities"
	"VetiCare/entities/dto"
	"VetiCare/services"
	"VetiCare/validators"
	"encoding/json"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"net/http"
	"time"
)

type PetController struct {
	Service *services.PetService
}

func NewPetController(service *services.PetService) *PetController {
	return &PetController{Service: service}
}

func (pc *PetController) RegisterRoutes(r *mux.Router, authMiddleware func(http.Handler) http.Handler) {
	r.Handle("/api/pets", authMiddleware(http.HandlerFunc(pc.CreatePet))).Methods("POST")
	r.Handle("/api/pets", authMiddleware(http.HandlerFunc(pc.GetAllPets))).Methods("GET")
	r.Handle("/api/pets/active", authMiddleware(http.HandlerFunc(pc.GetActivePets))).Methods("GET")
	r.Handle("/api/pets/owner/{owner_id}", authMiddleware(http.HandlerFunc(pc.GetPetsByOwner))).Methods("GET")
	r.Handle("/api/pets/{id}", authMiddleware(http.HandlerFunc(pc.GetPetByID))).Methods("GET")
	r.Handle("/api/pets/{id}", authMiddleware(http.HandlerFunc(pc.UpdatePet))).Methods("PUT")
	r.Handle("/api/pets/{id}", authMiddleware(http.HandlerFunc(pc.DeletePet))).Methods("DELETE")
}

func (pc *PetController) CreatePet(w http.ResponseWriter, r *http.Request) {
	var petDTO dto.PetDTO
	if err := json.NewDecoder(r.Body).Decode(&petDTO); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}
	if err := validators.ValidatePetDTO(petDTO); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	pet := entities.Pet{
		Name:      petDTO.Name,
		OwnerID:   uuid.MustParse(petDTO.OwnerID),
		SpeciesID: petDTO.SpeciesID,
		BirthDate: petDTO.BirthDate,
		Breed:     petDTO.Breed,
		StatusID:  petDTO.StatusID,
	}
	if err := pc.Service.CreatePet(&pet); err != nil {
		http.Error(w, "Error creando mascota: "+err.Error(), http.StatusInternalServerError)
		return
	}
	completePet, err := pc.Service.GetPetByID(pet.ID.String())
	if err != nil {
		http.Error(w, "Error obteniendo mascota creada: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(dto.ToPetDTO(completePet))
}

func (pc *PetController) GetAllPets(w http.ResponseWriter, _ *http.Request) {
	pets, err := pc.Service.GetAllPets()
	if err != nil {
		http.Error(w, "Error al obtener mascotas: "+err.Error(), http.StatusInternalServerError)
		return
	}
	var dtos []dto.PetDTO
	for _, pet := range pets {
		dtos = append(dtos, dto.ToPetDTO(&pet))
	}
	json.NewEncoder(w).Encode(dtos)
}

func (pc *PetController) GetActivePets(w http.ResponseWriter, _ *http.Request) {
	pets, err := pc.Service.GetActivePets()
	if err != nil {
		http.Error(w, "Error obteniendo mascotas activas: "+err.Error(), http.StatusInternalServerError)
		return
	}
	var dtos []dto.PetDTO
	for _, pet := range pets {
		dtos = append(dtos, dto.ToPetDTO(&pet))
	}
	json.NewEncoder(w).Encode(dtos)
}

func (pc *PetController) GetPetsByOwner(w http.ResponseWriter, r *http.Request) {
	ownerID := mux.Vars(r)["owner_id"]
	pets, err := pc.Service.GetPetsByOwner(ownerID)
	if err != nil {
		http.Error(w, "Error obteniendo mascotas por dueño: "+err.Error(), http.StatusInternalServerError)
		return
	}
	var dtos []dto.PetDTO
	for _, pet := range pets {
		dtos = append(dtos, dto.ToPetDTO(&pet))
	}
	json.NewEncoder(w).Encode(dtos)
}

func (pc *PetController) GetPetByID(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	pet, err := pc.Service.GetPetByID(id)
	if err != nil {
		http.Error(w, "Error al obtener mascota: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if pet == nil {
		http.Error(w, "Mascota no encontrada", http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(dto.ToPetDTO(pet))
}

func (pc *PetController) UpdatePet(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	var fields map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&fields); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	if name, ok := fields["name"].(string); ok {
		if err := validators.ValidatePetName(name); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
	}
	if ownerID, ok := fields["owner_id"].(string); ok {
		if err := validators.ValidatePetOwnerID(ownerID); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
	}
	if speciesID, ok := fields["species_id"].(float64); ok { // JSON num decoded as float64
		if err := validators.ValidatePetSpeciesID(int(speciesID)); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
	}
	if birthDateStr, ok := fields["birth_date"].(string); ok {
		birthDate, err := time.Parse(time.RFC3339, birthDateStr)
		if err != nil {
			http.Error(w, "Formato de fecha de nacimiento inválido", http.StatusBadRequest)
			return
		}
		if err := validators.ValidatePetBirthDate(&birthDate); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
	}
	if breed, ok := fields["breed"].(string); ok {
		if err := validators.ValidatePetBreed(&breed); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
	}
	if statusID, ok := fields["status_id"].(float64); ok {
		if err := validators.ValidatePetStatusID(int(statusID)); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
	}

	if err := pc.Service.UpdatePet(id, fields); err != nil {
		http.Error(w, "Error al actualizar mascota: "+err.Error(), http.StatusInternalServerError)
		return
	}
	pet, err := pc.Service.GetPetByID(id)
	if err != nil {
		http.Error(w, "Error al obtener mascota actualizada: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if pet == nil {
		http.Error(w, "Mascota no encontrada", http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(dto.ToPetDTO(pet))
}

func (pc *PetController) DeletePet(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	msg, err := pc.Service.DeletePet(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"message": msg})
}
