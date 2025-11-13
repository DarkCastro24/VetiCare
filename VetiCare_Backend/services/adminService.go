package services

import (
	"VetiCare/entities"
	"VetiCare/entities/dto"
	"VetiCare/repositories"
	"VetiCare/utils"
	"fmt"
)

type AdminService struct {
	Repo repositories.AdminRepository
}

func NewAdminService(r repositories.AdminRepository) *AdminService       { return &AdminService{Repo: r} }
func (s *AdminService) GetAll() ([]entities.Admin, error)                { return s.Repo.GetAll() }
func (s *AdminService) GetByID(id string) (*entities.Admin, error)       { return s.Repo.GetByID(id) }
func (s *AdminService) Update(id string, f map[string]interface{}) error { return s.Repo.Update(id, f) }
func (s *AdminService) ChangePassword(email, current, new string) error {
	return s.Repo.ChangePassword(email, current, new)
}

func (s *AdminService) Delete(id string) (string, error) {
	newStatus, err := s.Repo.Delete(id)
	if err != nil {
		return "", err
	}
	if newStatus == 1 {
		return "Administrador activado correctamente", nil
	}
	return "Administrador desactivado correctamente", nil
}

func (s *AdminService) Login(identifier, pass string) (*entities.Admin, error) {
	admin, err := s.Repo.GetByEmail(identifier)
	if err != nil {
		return nil, fmt.Errorf("ocurrio un error al buscar administrador")
	}
	if admin == nil {
		admin, err = s.Repo.GetByUsername(identifier)
		if err != nil {
			return nil, fmt.Errorf("ocurrio un error al buscar administrador")
		}
		if admin == nil {
			return nil, fmt.Errorf("las credenciales ingresadas son inválidas")
		}
	}
	if !utils.CheckPasswordHash(pass, admin.PasswordHash) {
		return nil, fmt.Errorf("las credenciales ingresadas son inválidas")
	}
	return admin, nil
}

func (s *AdminService) Register(input dto.AdminRegisterDTO) (*entities.Admin, string, error) {
	passwordPlain := input.Password
	if passwordPlain == "" {
		passwordPlain = utils.GenerateRandomPassword(8)
	}
	hash, err := utils.HashPassword(passwordPlain)
	if err != nil {
		return nil, "", err
	}
	admin := &entities.Admin{
		FullName:     input.FullName,
		Username:     input.Username,
		DUI:          input.DUI,
		Email:        input.Email,
		Phone:        input.Phone,
		PasswordHash: hash,
		StatusID:     input.StatusID,
		AdminTypeID:  input.AdminTypeID,
	}
	err = s.Repo.Create(admin)
	if err != nil {
		return nil, "", err
	}
	adminWithType, err := s.Repo.GetByID(admin.ID.String())
	if err != nil {
		return nil, "", err
	}
	return adminWithType, passwordPlain, nil
}
