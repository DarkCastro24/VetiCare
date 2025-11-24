package entities

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
	"time"
)

type PassResetToken struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	UserId    uuid.UUID `gorm:"type:uuid" json:"user_id"`
	Token     string    `json:"token"`
	ExpiresAt time.Time `json:"expires_at"`
	Used      bool      `json:"used"`
}

func (t *PassResetToken) BeforeCreate(tx *gorm.DB) (err error) {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	return
}
