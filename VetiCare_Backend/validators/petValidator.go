package validators

import (
	"VetiCare/entities/dto"
	"errors"
	"time"

	"github.com/google/uuid"
)

var (
	ErrInvalidName      = errors.New("el nombre de la mascota es obligatorio y debe tener entre 1 y 80 caracteres")
	ErrInvalidOwnerID   = errors.New("el dueño es obligatorio y debe ser un UUID válido")
	ErrInvalidSpeciesID = errors.New("el ID de especie es obligatorio y debe ser mayor que cero")
	ErrInvalidBirthDate = errors.New("la fecha de nacimiento debe ser una fecha válida y no futura")
	ErrInvalidBreed     = errors.New("la raza, si se proporciona, debe tener máximo 50 caracteres")
	ErrInvalidStatusID  = errors.New("el estado es obligatorio y debe ser un valor válido")
)

func ValidatePetName(name string) error {
	if len(name) == 0 || len(name) > 80 {
		return ErrInvalidName
	}
	return nil
}

func ValidatePetOwnerID(ownerID string) error {
	_, err := uuid.Parse(ownerID)
	if err != nil {
		return ErrInvalidOwnerID
	}
	return nil
}

func ValidatePetSpeciesID(speciesID int) error {
	if speciesID <= 0 {
		return ErrInvalidSpeciesID
	}
	return nil
}

func ValidatePetBirthDate(birthDate *time.Time) error {
	if birthDate == nil {
		return nil
	}
	if birthDate.After(time.Now()) {
		return ErrInvalidBirthDate
	}
	return nil
}

func ValidatePetBreed(breed *string) error {
	if breed == nil {
		return nil
	}
	if len(*breed) > 50 {
		return ErrInvalidBreed
	}
	return nil
}

func ValidatePetStatusID(statusID int) error {
	if statusID < 1 {
		return ErrInvalidStatusID
	}
	return nil
}

func ValidatePetDTO(pet dto.PetDTO) error {
	if err := ValidatePetName(pet.Name); err != nil {
		return err
	}
	if err := ValidatePetOwnerID(pet.OwnerID); err != nil {
		return err
	}
	if err := ValidatePetSpeciesID(pet.SpeciesID); err != nil {
		return err
	}
	if err := ValidatePetBirthDate(pet.BirthDate); err != nil {
		return err
	}
	if err := ValidatePetBreed(pet.Breed); err != nil {
		return err
	}
	return nil
}
