package entities

import (
	"time"
)

type AdminType struct {
	ID        int       `gorm:"primaryKey;autoIncrement" json:"id"`
	Type      string    `gorm:"size:30;not null;unique" json:"type"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}
