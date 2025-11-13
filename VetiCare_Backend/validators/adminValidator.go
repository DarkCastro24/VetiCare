package validators

import (
	"VetiCare/entities/dto"
	"errors"
)

var (
	ErrInvalidFullNameAdmin  = errors.New("El nombre debe contener solo letras")
	ErrInvalidUsernameAdmin  = errors.New("El nombre de usuario debe tener entre 3 y 50 caracteres")
	ErrInvalidDUIAdmin       = errors.New("Formato de DUI inválido el formato correcto es ########-#")
	ErrInvalidPhoneAdmin     = errors.New("Formato de teléfono inválido el formato correcto es ####-####")
	ErrInvalidEmailAdmin     = errors.New("Direccion de correo inválido")
	ErrInvalidAdminTypeAdmin = errors.New("Tipo de administrador inválido")
)

func ValidateUsername(username string) error {
	if len(username) < 3 || len(username) > 50 {
		return ErrInvalidUsernameAdmin
	}
	return nil
}

func ValidateAdminTypeID(adminTypeID int) error {
	if adminTypeID <= 0 {
		return ErrInvalidAdminTypeAdmin
	}
	return nil
}

func ValidateAdminRegisterDTO(admin dto.AdminRegisterDTO) error {
	if err := ValidateFullName(admin.FullName); err != nil {
		return ErrInvalidFullNameAdmin
	}
	if err := ValidateUsername(admin.Username); err != nil {
		return err
	}
	if err := ValidateDUI(admin.DUI); err != nil {
		return ErrInvalidDUIAdmin
	}
	if err := ValidatePhone(admin.Phone); err != nil {
		return ErrInvalidPhoneAdmin
	}
	if err := ValidateEmail(admin.Email); err != nil {
		return ErrInvalidEmailAdmin
	}
	if err := ValidatePassword(admin.Password); err != nil {
		return nil
	}
	if err := ValidateAdminTypeID(admin.AdminTypeID); err != nil {
		return ErrInvalidAdminTypeAdmin
	}
	return nil
}
