package services

import (
	"VetiCare/entities"
	"VetiCare/entities/dto"
	"VetiCare/repositories"
	"VetiCare/utils"
	"errors"
	"fmt"
	"os"
	"time"
)

type UserService struct {
	Repo         repositories.UserRepository
	EmailService EmailService
	TokenRepo    repositories.TokenRepository
}

func NewUserService(repo repositories.UserRepository, emailService EmailService, tokenRepo repositories.TokenRepository) *UserService {
	return &UserService{Repo: repo, EmailService: emailService, TokenRepo: tokenRepo}
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

func (s *UserService) Login(input dto.LoginDTO) (user *entities.User, token string, error error) {
	user, err := s.Repo.Login(input.Email, input.Password)
	if err != nil {
		return nil, "", fmt.Errorf("error al login usuario: %v", err)
	}
	token, err = utils.GenerateJWT(user.ID.String(), user.Email)
	if err != nil {
		return nil, "", fmt.Errorf("No se pudo generar el token:  %v", err)
	}
	return user, token, nil
}

func (s *UserService) ChangePassword(email, currentPassword, newPassword string) error {
	user, err := s.GetUserByEmail(email)
	if user == nil && err == nil {
		return errors.New("no se encontró el usuario")
	}
	if err != nil {
		return errors.New("error al leer el usuario" + err.Error())
	}

	if !utils.CheckPasswordHash(currentPassword, user.PasswordHash) {
		return fmt.Errorf("la contraseña actual es incorrecta")
	}

	hashedPassword, err := utils.HashPassword(newPassword)
	if err != nil {
		return fmt.Errorf("error al hashear la nueva contraseña: %v", err)
	}

	return s.Repo.ChangePassword(user, hashedPassword)
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

func (s *UserService) UpdateUser(id string, input dto.UpdateUserDTO) error {
	updateFields := make(map[string]interface{})
	if input.FullName != nil {
		updateFields["full_name"] = *input.FullName
	}
	if input.DUI != nil {
		err := s.DUINotTaken(*input.DUI)
		if err != nil {
			return err
		}
		updateFields["dui"] = *input.DUI
	}

	if input.Phone != nil {
		updateFields["phone"] = *input.Phone
	}

	if input.Email != nil {
		err := s.EmailNotTaken(*input.Email)
		if err != nil {
			return err
		}
		updateFields["email"] = *input.Email
	}
	return s.Repo.Update(id, updateFields)
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

// validators
func (s *UserService) EmailNotTaken(email string) error {
	user, err := s.Repo.GetByEmail(email)
	if user == nil && err == nil {
		return nil
	}
	if err == nil {
		return errors.New("el email ya es utilizado")
	}
	return nil
}

func (s *UserService) DUINotTaken(DUI string) error {
	user, err := s.Repo.GetByDUI(DUI)
	if user == nil && err == nil {
		return nil
	}
	if err == nil {
		return errors.New("el dui ya es utilizado")
	}
	return nil
}

func (s *UserService) RequestEmail(email string) error {
	user, err := s.Repo.GetByEmail(email)
	if user == nil && err == nil {
		return nil
	}
	tokenStr, err := utils.GenerateSecureToken(32)
	if err != nil {
		return err
	}

	token := &entities.PassResetToken{
		Token:     tokenStr,
		UserId:    user.ID,
		ExpiresAt: time.Now().Add(15 * time.Minute),
		Used:      false,
	}

	if err := s.TokenRepo.Create(token); err != nil {
		return err
	}

	resetURL := fmt.Sprintf("%s/reset-password?token=%s", os.Getenv("FRONTEND_URL"), tokenStr)

	//message := fmt.Sprintf(
	//	"Hola %s,\n\n"+
	//		"Hemos recibido una solicitud para restablecer tu contraseña.\n"+
	//		"Si no realizaste esta petición, puedes ignorar este mensaje.\n\n"+
	//		"Para continuar con el proceso, utiliza el siguiente enlace proporcionado por el sistema:\n\n"+
	//		"Enlace de restablecimiento: %s\n\n"+
	//		"Si encuentras algún inconveniente, no dudes en contactarnos.\n\n"+
	//		"Saludos.",
	//	user.FullName,
	//	resetURL,
	//)

	return s.EmailService.SendPasswordResetEmail(user.Email, "Olvidaste tu contraseña", resetURL)

}

func (s *UserService) ResetPassword(token, newPassword string) error {
	t, err := s.TokenRepo.Get(token)
	if t == nil {
		return errors.New("token invalido")
	}

	if err != nil {
		return err
	}
	user, err := s.Repo.GetByID(t.UserId.String())
	if err != nil || user == nil {
		return errors.New("No se encontro el usuario")
	}
	hashed, err := utils.HashPassword(newPassword)
	if err != nil {
		return errors.New("Error al hash la contrasena")
	}
	err = s.Repo.ChangePassword(user, hashed)
	if err != nil {
		return err
	}
	return nil

}
