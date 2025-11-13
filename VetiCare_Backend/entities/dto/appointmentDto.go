package dto

import (
	"VetiCare/entities"
)

type AppointmentDTO struct {
	ID                    string   `json:"id"`
	PetID                 string   `json:"pet_id"`
	Pet                   PetDTO   `json:"pet"`
	VetID                 *string  `json:"vet_id,omitempty"`
	Vet                   UserDTO  `json:"vet"`
	Date                  string   `json:"date"`
	Time                  string   `json:"time"`
	StatusID              int      `json:"status_id"`
	Status                string   `json:"status"`
	Reason                string   `json:"reason,omitempty"`
	WeightKg              *float64 `json:"weight_kg,omitempty"`
	Temperature           *float64 `json:"temperature,omitempty"`
	VaccinationStatus     string   `json:"vaccination_status,omitempty"`
	MedicationsPrescribed string   `json:"medications_prescribed,omitempty"`
	AdditionalNotes       string   `json:"additional_notes,omitempty"`
	CreatedAt             string   `json:"created_at"`
	UpdatedAt             string   `json:"updated_at"`
}

func NewAppointmentDTO(app *entities.Appointment) AppointmentDTO {
	statusMap := map[int]string{
		1: "Agendada",
		2: "Finalizada",
		3: "Cancelada",
	}

	statusText, ok := statusMap[app.StatusID]
	if !ok {
		statusText = "Desconocido"
	}

	var vetID *string
	if app.VetID != nil {
		s := app.VetID.String()
		vetID = &s
	}

	return AppointmentDTO{
		ID:                    app.ID.String(),
		PetID:                 app.PetID.String(),
		Pet:                   ToPetDTO(&app.Pet),
		VetID:                 vetID,
		Vet:                   ToUserDTO(&app.Vet),
		Date:                  app.Date,
		Time:                  app.Time,
		StatusID:              app.StatusID,
		Status:                statusText,
		Reason:                app.Reason,
		WeightKg:              app.WeightKg,
		Temperature:           app.Temperature,
		VaccinationStatus:     app.VaccinationStatus,
		MedicationsPrescribed: app.MedicationsPrescribed,
		AdditionalNotes:       app.AdditionalNotes,
		CreatedAt:             app.CreatedAt.Format("2006-01-02 15:04:05"),
		UpdatedAt:             app.UpdatedAt.Format("2006-01-02 15:04:05"),
	}
}
