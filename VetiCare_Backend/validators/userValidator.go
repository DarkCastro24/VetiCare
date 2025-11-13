package validators

import (
	"VetiCare/entities/dto"
	"errors"
)

var (
	ErrInvalidFullNameUser = errors.New("EL nombre completo debe contener solo letras")
	ErrInvalidDUIUser      = errors.New("DUI inválido: formato esperado ########-#")
	ErrInvalidPhoneUser    = errors.New("EL numero de teléfono es inválido, formato esperado ####-####")
	ErrInvalidEmailUser    = errors.New("LA direccion de correo es invalida")
)

func ValidateUserDTO(user dto.UserDTO) error {
	if err := ValidateFullName(user.FullName); err != nil {
		return ErrInvalidFullNameUser
	}
	if err := ValidateDUI(user.DUI); err != nil {
		return ErrInvalidDUIUser
	}
	if err := ValidatePhone(user.Phone); err != nil {
		return ErrInvalidPhoneUser
	}
	if err := ValidateEmail(user.Email); err != nil {
		return ErrInvalidEmailUser
	}
	if err := ValidatePassword(user.Password); err != nil {
		return err
	}
	return nil
}
