package services

import (
	"VetiCare/entities"
	"VetiCare/entities/dto"
	"VetiCare/repositories"
	"VetiCare/utils"
	"fmt"
)

type UserService struct {
	Repo         repositories.UserRepository
	EmailService EmailService
}

func NewUserService(repo repositories.UserRepository, emailService EmailService) *UserService {
	return &UserService{Repo: repo, EmailService: emailService}
}

func (s *UserService) Register(userDTO *dto.UserDTO) (*entities.User, error) {
	passwordPlain := userDTO.Password
	if passwordPlain == "" {
		passwordPlain = utils.GenerateRandomPassword(8)
	}

	hashedPassword, err := utils.HashPassword(passwordPlain)
	if err != nil {
		return nil, fmt.Errorf("error al hashear la contraseña: %v", err)
	}

	user := entities.User{
		FullName:     userDTO.FullName,
		DUI:          userDTO.DUI,
		Phone:        userDTO.Phone,
		Email:        userDTO.Email,
		RoleID:       userDTO.RoleID,
		StatusID:     userDTO.StatusID,
		PasswordHash: hashedPassword,
	}
	if user.RoleID == 2 {
		user.PF = 1
	}
	err = s.Repo.Register(&user)
	if err != nil {
		return nil, fmt.Errorf("error al registrar al usuario: %v", err)
	}
	if err := s.EmailService.SendWelcomeEmail(user.Email, "Bienvenido"+
		"a VetiCare", dto.WelcomeEmailUser{Email: user.Email, FullName: user.FullName, Password: passwordPlain}); err != nil {
		return nil, fmt.Errorf("error al email al usuario: %v", err)
	}
	return &user, nil
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
