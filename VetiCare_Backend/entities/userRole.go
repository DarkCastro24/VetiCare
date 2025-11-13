package entities

import (
	"time"
)

type UserRole struct {
	ID        int       `gorm:"primaryKey;autoIncrement" json:"id"`
	Role      string    `gorm:"size:100;not null;unique" json:"role_name"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}
