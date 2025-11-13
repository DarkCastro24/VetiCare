package entities

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Appointment struct {
	ID                    uuid.UUID  `gorm:"type:uuid;primaryKey" json:"id"`
	PetID                 uuid.UUID  `gorm:"type:uuid;not null" json:"pet_id"`
	Pet                   Pet        `gorm:"foreignKey:PetID" json:"pet"`
	VetID                 *uuid.UUID `gorm:"type:uuid" json:"vet_id,omitempty"`
	Vet                   User       `gorm:"foreignKey:VetID" json:"vet"`
	Date                  string     `gorm:"size:10;not null" json:"date"`
	Time                  string     `gorm:"size:5;not null" json:"time"`
	StatusID              int        `gorm:"not null;default:1" json:"status_id"`
	Reason                string     `gorm:"size:300" json:"reason,omitempty"`
	WeightKg              *float64   `gorm:"type:numeric(5,2)" json:"weight_kg,omitempty"`
	Temperature           *float64   `gorm:"type:numeric(4,1)" json:"temperature,omitempty"`
	VaccinationStatus     string     `gorm:"size:300" json:"vaccination_status,omitempty"`
	MedicationsPrescribed string     `gorm:"size:300" json:"medications_prescribed,omitempty"`
	AdditionalNotes       string     `gorm:"size:500" json:"additional_notes,omitempty"`

	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

type MonthlyAppointments struct {
	Year  int `json:"year"`
	Month int `json:"month"`
	Count int `json:"count"`
}

func (a *Appointment) BeforeCreate(tx *gorm.DB) (err error) {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	return
}
