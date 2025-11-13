package services

import (
	"VetiCare/entities"
	"VetiCare/repositories"
)

type SpeciesService struct {
	Repo repositories.SpeciesRepository
}

func NewSpeciesService(repo repositories.SpeciesRepository) *SpeciesService {
	return &SpeciesService{Repo: repo}
}

func (s *SpeciesService) GetAll() ([]entities.Species, error) {
	return s.Repo.GetAll()
}

func (s *SpeciesService) GetByID(id int) (*entities.Species, error) {
	return s.Repo.GetByID(id)
}

func (s *SpeciesService) Create(species *entities.Species) error {
	return s.Repo.Create(species)
}

func (s *SpeciesService) Update(id int, fields map[string]interface{}) error {
	return s.Repo.Update(id, fields)
}

func (s *SpeciesService) Delete(id int) error {
	return s.Repo.Delete(id)
}
