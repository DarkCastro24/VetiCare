package services

import (
	"VetiCare/entities"
	"VetiCare/repositories"
)

type UserRoleService struct {
	Repo repositories.UserRoleRepository
}

func NewUserRoleService(repo repositories.UserRoleRepository) *UserRoleService {
	return &UserRoleService{Repo: repo}
}

func (s *UserRoleService) GetAll() ([]entities.UserRole, error) {
	return s.Repo.GetAll()
}

func (s *UserRoleService) GetByID(id int) (*entities.UserRole, error) {
	return s.Repo.GetByID(id)
}

func (s *UserRoleService) Create(role *entities.UserRole) error {
	return s.Repo.Create(role)
}

func (s *UserRoleService) Update(id int, fields map[string]interface{}) error {
	return s.Repo.Update(id, fields)
}

func (s *UserRoleService) Delete(id int) error {
	return s.Repo.Delete(id)
}
