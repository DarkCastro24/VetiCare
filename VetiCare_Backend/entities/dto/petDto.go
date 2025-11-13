package dto

import (
	"VetiCare/entities"
	"time"
)

type SpeciesDTO struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	ImageURL string `json:"image_url"`
}

type PetDTO struct {
	ID        string         `json:"id,omitempty"`
	Name      string         `json:"name"`
	OwnerID   string         `json:"owner_id"`
	Owner     UserSummaryDTO `json:"owner"`
	SpeciesID int            `json:"species_id"`
	Species   SpeciesDTO     `json:"species"`
	BirthDate *time.Time     `json:"birth_date"`
	Breed     *string        `json:"breed,omitempty"`
	StatusID  int            `json:"status_id"`
	Status    string         `json:"status"`
	CreatedAt *string        `json:"created_at,omitempty"`
	UpdatedAt *string        `json:"updated_at,omitempty"`
}

func ToPetDTO(pet *entities.Pet) PetDTO {
	statusText := "Inactiva"
	if pet.StatusID == 1 {
		statusText = "Activa"
	}

	var createdAtStr, updatedAtStr *string
	if !pet.CreatedAt.IsZero() {
		s := pet.CreatedAt.Format("2006-01-02 15:04:05")
		createdAtStr = &s
	}
	if !pet.UpdatedAt.IsZero() {
		s := pet.UpdatedAt.Format("2006-01-02 15:04:05")
		updatedAtStr = &s
	}

	return PetDTO{
		ID:        pet.ID.String(),
		Name:      pet.Name,
		OwnerID:   pet.OwnerID.String(),
		Owner:     ToUserSummaryDTO(&pet.Owner),
		SpeciesID: pet.SpeciesID,
		Species: SpeciesDTO{
			ID:       pet.Species.ID,
			Name:     pet.Species.Name,
			ImageURL: pet.Species.ImageURL,
		},
		BirthDate: pet.BirthDate,
		Breed:     pet.Breed,
		StatusID:  pet.StatusID,
		Status:    statusText,
		CreatedAt: createdAtStr,
		UpdatedAt: updatedAtStr,
	}
}

func ToUserSummaryDTO(u *entities.User) UserSummaryDTO {
	if u == nil {
		return UserSummaryDTO{}
	}

	return UserSummaryDTO{
		ID:       u.ID.String(),
		FullName: u.FullName,
		DUI:      u.DUI,
		Phone:    u.Phone,
	}
}
