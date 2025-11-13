package entities

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
	"time"
)

type Pet struct {
	ID        uuid.UUID  `gorm:"type:uuid;primaryKey" json:"id"`
	OwnerID   uuid.UUID  `gorm:"type:uuid;not null" json:"owner_id"`
	Owner     User       `gorm:"foreignKey:OwnerID" json:"owner"`
	Name      string     `gorm:"size:80;not null" json:"name"`
	BirthDate *time.Time `json:"birth_date,omitempty"`
	SpeciesID int        `gorm:"not null" json:"species_id"`
	Breed     *string    `gorm:"size:50" json:"breed,omitempty"`
	StatusID  int        `gorm:"not null;default:1" json:"status_id"`
	CreatedAt time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
	Species   Species    `gorm:"foreignKey:SpeciesID" json:"species"`
}

func (p *Pet) BeforeCreate(tx *gorm.DB) (err error) {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return
}
