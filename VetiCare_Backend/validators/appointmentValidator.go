package validators

import (
	"VetiCare/entities/dto"
	"errors"
	"time"

	"github.com/google/uuid"
)

var (
	ErrInvalidPetID           = errors.New("pet_id es obligatorio y debe ser un UUID válido")
	ErrInvalidVetID           = errors.New("vet_id debe ser un UUID válido")
	ErrInvalidDateOnly        = errors.New("la fecha es obligatoria y debe tener formato DD-MM-YYYY")
	ErrInvalidTimeOnly        = errors.New("la hora es obligatoria y debe tener formato HH.MM")
	ErrInvalidDateTimeInPast  = errors.New("la fecha y hora de la cita no pueden ser en el pasado")
	ErrInvalidWeight          = errors.New("el peso debe ser un número positivo")
	ErrInvalidTemperature     = errors.New("la temperatura debe ser un número positivo")
	ErrInvalidReasonLength    = errors.New("la razón debe tener máximo 300 caracteres")
	ErrInvalidVaccinationLen  = errors.New("El estado de vacunacion debe tener máximo 500 caracteres")
	ErrInvalidMedicationsLen  = errors.New("Las medicaciones deben tener máximo 300 caracteres")
	ErrInvalidAdditionalNotes = errors.New("Las notas adicionales deben tener máximo 500 caracteres")
)

func ValidateUUIDRequired(id string) error {
	_, err := uuid.Parse(id)
	if err != nil {
		return errors.New("UUID inválido: " + id)
	}
	return nil
}

func ValidateUUIDOptional(id *string) error {
	if id == nil || *id == "" {
		return nil
	}
	_, err := uuid.Parse(*id)
	if err != nil {
		return errors.New("UUID inválido: " + *id)
	}
	return nil
}

func ValidateDate(date string) error {
	if date == "" {
		return nil
	}
	if len(date) != 10 {
		return ErrInvalidDateOnly
	}
	_, err := time.Parse("02-01-2006", date)
	if err != nil {
		return ErrInvalidDateOnly
	}
	return nil
}

func ValidateTime(timeStr string) error {
	if timeStr == "" {
		return nil
	}
	if len(timeStr) != 5 {
		return ErrInvalidTimeOnly
	}
	_, err := time.Parse("15:04", timeStr)
	if err != nil {
		return ErrInvalidTimeOnly
	}
	return nil
}

func ValidateDateTimeNotPast(dateOnly, timeOnly string) error {
	dateParsed, err := time.Parse("02-01-2006", dateOnly)
	if err != nil {
		return ErrInvalidDateOnly
	}
	timeParsed, err := time.Parse("15.04", timeOnly)
	if err != nil {
		return ErrInvalidTimeOnly
	}
	dateTime := time.Date(dateParsed.Year(), dateParsed.Month(), dateParsed.Day(),
		timeParsed.Hour(), timeParsed.Minute(), 0, 0, time.UTC)

	if dateTime.Before(time.Now()) {
		return ErrInvalidDateTimeInPast
	}
	return nil
}

func ValidateStatusID(statusID int) error {
	if statusID < 1 || statusID > 3 {
		return errors.New("Status_id inválido, debe ser un valor numerico")
	}
	return nil
}

func ValidatePositiveFloat(value *float64, errMsg error) error {
	if value != nil && *value < 0 {
		return errMsg
	}
	return nil
}

func ValidateMaxLen(s string, max int, errMsg error) error {
	if s == "" {
		return nil
	}
	if len(s) > max {
		return errMsg
	}
	return nil
}

func ValidateAppointmentDTO(app dto.AppointmentDTO) error {
	if err := ValidateUUIDRequired(app.PetID); err != nil {
		return ErrInvalidPetID
	}
	if err := ValidateUUIDOptional(app.VetID); err != nil {
		return ErrInvalidVetID
	}
	if err := ValidateDate(app.Date); err != nil {
		return err
	}
	if err := ValidateTime(app.Time); err != nil {
		return err
	}
	if app.Date != "" && app.Time != "" {
		if err := ValidateDateTimeNotPast(app.Date, app.Time); err != nil {
			return err
		}
	}
	if err := ValidateStatusID(app.StatusID); err != nil {
		return err
	}
	if err := ValidatePositiveFloat(app.WeightKg, ErrInvalidWeight); err != nil {
		return err
	}
	if err := ValidatePositiveFloat(app.Temperature, ErrInvalidTemperature); err != nil {
		return err
	}
	if err := ValidateMaxLen(app.Reason, 300, ErrInvalidReasonLength); err != nil {
		return err
	}
	if err := ValidateMaxLen(app.VaccinationStatus, 500, ErrInvalidVaccinationLen); err != nil {
		return err
	}
	if err := ValidateMaxLen(app.MedicationsPrescribed, 300, ErrInvalidMedicationsLen); err != nil {
		return err
	}
	if err := ValidateMaxLen(app.AdditionalNotes, 500, ErrInvalidAdditionalNotes); err != nil {
		return err
	}
	return nil
}
