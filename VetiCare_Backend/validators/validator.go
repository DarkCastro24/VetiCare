package validators

import (
	"errors"
	"regexp"
	"sync"

	"github.com/go-playground/validator/v10"
)

var (
	validateInstance *validator.Validate
	once             sync.Once

	reOnlyLetters = regexp.MustCompile(`^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$`)
	reDUI         = regexp.MustCompile(`^\d{8}-\d$`)
	rePhone       = regexp.MustCompile(`^\d{4}-\d{4}$`)
	reEmail       = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
)

func GetValidator() *validator.Validate {
	once.Do(func() {
		validateInstance = validator.New()

		validateInstance.RegisterValidation("alphabetic", func(fl validator.FieldLevel) bool {
			value := fl.Field().String()
			return reOnlyLetters.MatchString(value)
		})

		validateInstance.RegisterValidation("duiFormat", func(fl validator.FieldLevel) bool {
			dui := fl.Field().String()
			return reDUI.MatchString(dui)
		})

		validateInstance.RegisterValidation("phoneFormat", func(fl validator.FieldLevel) bool {
			phone := fl.Field().String()
			return rePhone.MatchString(phone)
		})

		validateInstance.RegisterValidation("emailFormat", func(fl validator.FieldLevel) bool {
			email := fl.Field().String()
			return reEmail.MatchString(email)
		})
	})
	return validateInstance
}

func ValidateFullName(fullName string) error {
	err := GetValidator().Var(fullName, "required,alphabetic")
	if err != nil {
		return err
	}
	return nil
}

func ValidateDUI(dui string) error {
	err := GetValidator().Var(dui, "required,duiFormat")
	if err != nil {
		return err
	}
	return nil
}

func ValidatePhone(phone string) error {
	err := GetValidator().Var(phone, "required,phoneFormat")
	if err != nil {
		return err
	}
	return nil
}

func ValidateEmail(email string) error {
	err := GetValidator().Var(email, "required,emailFormat")
	if err != nil {
		return err
	}
	return nil
}

var (
	reUpper  = regexp.MustCompile(`[A-Z]`)
	reNumber = regexp.MustCompile(`[0-9]`)
)

func ValidatePassword(password string) error {
	if password == "" {
		return nil
	}
	if len(password) < 6 {
		return errors.New("La contraseña debe tener al menos 6 caracteres")
	}
	if !reUpper.MatchString(password) {
		return errors.New("La contraseña debe contener al menos una letra mayúscula")
	}
	if !reNumber.MatchString(password) {
		return errors.New("La contraseña debe contener al menos un número")
	}
	return nil
}

type ValidationError struct {
	Message string
}

func (e *ValidationError) Error() string {
	return e.Message
}
