package services

import (
	"VetiCare/entities"
	"VetiCare/repositories"
)

type AdminTypeService struct {
	Repo repositories.AdminTypeRepository
}

func NewAdminTypeService(repo repositories.AdminTypeRepository) *AdminTypeService {
	return &AdminTypeService{Repo: repo}
}

func (s *AdminTypeService) GetAll() ([]entities.AdminType, error) {
	return s.Repo.GetAll()
}

func (s *AdminTypeService) GetByID(id int) (*entities.AdminType, error) {
	return s.Repo.GetByID(id)
}

func (s *AdminTypeService) Create(adminType *entities.AdminType) error {
	return s.Repo.Create(adminType)
}

func (s *AdminTypeService) Update(id int, fields map[string]interface{}) error {
	return s.Repo.Update(id, fields)
}

func (s *AdminTypeService) Delete(id int) error {
	// Aquí podrías agregar lógica para validar que no existan admins con ese tipo antes de eliminar
	return s.Repo.Delete(id)
}
