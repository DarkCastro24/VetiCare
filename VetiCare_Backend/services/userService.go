package services

import (
	"VetiCare/entities"
	"VetiCare/repositories"
)

type UserService struct {
	Repo repositories.UserRepository
}

func NewUserService(repo repositories.UserRepository) *UserService {
	return &UserService{Repo: repo}
}

func (s *UserService) Register(user *entities.User) error {
	if user.RoleID == 2 {
		user.PF = 1
	}
	return s.Repo.Register(user)
}

func (s *UserService) Login(email, password string) (*entities.User, error) {
	return s.Repo.Login(email, password)
}

func (s *UserService) ChangePassword(email, currentPassword, newPassword string) error {
	return s.Repo.ChangePassword(email, currentPassword, newPassword)
}

func (s *UserService) CreateUser(user *entities.User) error {
	if user.RoleID == 2 {
		user.PF = 1
	}
	return s.Repo.Create(user)
}

func (s *UserService) GetUserByEmail(email string) (*entities.User, error) {
	return s.Repo.GetByEmail(email)
}

func (s *UserService) GetUsersByRole(roleID int) ([]entities.User, error) {
	return s.Repo.GetByRole(roleID)
}

func (s *UserService) GetUserByID(id string) (*entities.User, error) {
	return s.Repo.GetByID(id)
}

func (s *UserService) GetAllUsers() ([]entities.User, error) {
	return s.Repo.GetAll()
}

func (s *UserService) UpdateUser(id string, data map[string]interface{}) error {
	return s.Repo.Update(id, data)
}

func (s *UserService) DeleteUser(id string) (string, error) {
	newStatus, err := s.Repo.Delete(id)
	if err != nil {
		return "", err
	}
	if newStatus == 1 {
		return "Usuario activado correctamente", nil
	}
	return "Usuario desactivado correctamente", nil
}
