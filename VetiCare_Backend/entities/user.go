package entities

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	FullName     string    `gorm:"size:100;not null" json:"full_name"`
	DUI          string    `gorm:"column:dui;size:10;unique;not null" json:"dui"`
	Phone        string    `gorm:"size:9" json:"phone"`
	Email        string    `gorm:"size:100;unique;not null" json:"email"`
	PasswordHash string    `gorm:"size:175" json:"password_hash,omitempty"`
	RoleID       int       `gorm:"not null" json:"role_id"`
	StatusID     int       `gorm:"not null;default:1" json:"status_id"`
	Token        string    `gorm:"size:175" json:"token,omitempty"`
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime" json:"updated_at"`
	PF           int       `gorm:"default:2" json:"pf"`

	Role UserRole `gorm:"foreignKey:RoleID;references:ID" json:"role"`

	Pf int `gorm:"column:pf;default:1" json:"pf"`
}

type VetAppointments struct {
	VetID        string `json:"vet_id"`
	VetName      string `json:"vet_name"`
	Appointments int    `json:"appointments"`
}

func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return
}
