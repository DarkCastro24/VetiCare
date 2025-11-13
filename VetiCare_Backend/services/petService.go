package services

import (
	"VetiCare/entities"
	"VetiCare/repositories"
)

type PetService struct {
	Repo repositories.PetRepository
}

func NewPetService(repo repositories.PetRepository) *PetService {
	return &PetService{Repo: repo}
}

func (s *PetService) CreatePet(pet *entities.Pet) error {
	return s.Repo.Create(pet)
}

func (s *PetService) GetPetByID(id string) (*entities.Pet, error) {
	return s.Repo.GetByID(id)
}

func (s *PetService) GetAllPets() ([]entities.Pet, error) {
	return s.Repo.GetAll()
}

func (s *PetService) GetActivePets() ([]entities.Pet, error) {
	return s.Repo.GetActivePets()
}

func (s *PetService) GetPetsByOwner(ownerID string) ([]entities.Pet, error) {
	return s.Repo.GetPetsByOwner(ownerID)
}

func (s *PetService) UpdatePet(id string, fields map[string]interface{}) error {
	return s.Repo.Update(id, fields)
}

func (s *PetService) DeletePet(id string) (string, error) {
	newStatus, err := s.Repo.Delete(id)
	if err != nil {
		return "", err
	}
	if newStatus == 1 {
		return "Mascota activada correctamente", nil
	}
	return "Mascota desactivada correctamente", nil
}
