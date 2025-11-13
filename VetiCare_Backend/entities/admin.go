package entities

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Admin struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	FullName     string    `gorm:"size:100;not null" json:"full_name"`
	Username     string    `gorm:"size:50;unique;not null" json:"username"`
	DUI          string    `gorm:"column:dui;size:10;unique;not null" json:"dui"`
	Email        string    `gorm:"size:100;unique;not null" json:"email"`
	Phone        string    `gorm:"size:9" json:"phone"`
	PasswordHash string    `gorm:"size:255" json:"-"`
	StatusID     int       `gorm:"not null;default:1" json:"status_id"`
	AdminTypeID  int       `gorm:"not null" json:"admin_type_id"`

	AdminType AdminType `gorm:"foreignKey:AdminTypeID;references:ID" json:"admin_type"`

	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (a *Admin) BeforeCreate(tx *gorm.DB) (err error) {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	return
}
