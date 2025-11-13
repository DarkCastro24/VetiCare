package repositories

import (
	"VetiCare/entities"
	"errors"
	"fmt"

	"gorm.io/gorm"
)

type petRepositoryGORM struct {
	db *gorm.DB
}

func NewPetRepositoryGORM(db *gorm.DB) PetRepository {
	return &petRepositoryGORM{db: db}
}

func (r *petRepositoryGORM) Create(pet *entities.Pet) error {
	return r.db.Create(pet).Error
}

func (r *petRepositoryGORM) GetByID(id string) (*entities.Pet, error) {
	var pet entities.Pet
	err := r.db.Preload("Owner").Preload("Species").Where("id = ?", id).First(&pet).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &pet, err
}

func (r *petRepositoryGORM) GetAll() ([]entities.Pet, error) {
	var pets []entities.Pet
	err := r.db.Preload("Owner").Preload("Species").Find(&pets).Error
	return pets, err
}

func (r *petRepositoryGORM) GetActivePets() ([]entities.Pet, error) {
	var pets []entities.Pet
	err := r.db.Preload("Owner").Preload("Species").Where("status_id = ?", 1).Find(&pets).Error
	return pets, err
}

func (r *petRepositoryGORM) GetPetsByOwner(ownerID string) ([]entities.Pet, error) {
	var pets []entities.Pet
	err := r.db.Preload("Owner").Preload("Species").Where("owner_id = ?", ownerID).Find(&pets).Error
	return pets, err
}

func (r *petRepositoryGORM) Update(id string, fields map[string]interface{}) error {
	if len(fields) == 0 {
		return nil
	}
	return r.db.Model(&entities.Pet{}).Where("id = ?", id).Updates(fields).Error
}

func (r *petRepositoryGORM) Delete(id string) (int, error) {
	var pet entities.Pet
	result := r.db.First(&pet, "id = ?", id)
	if result.Error != nil {
		return 0, result.Error
	}
	if result.RowsAffected == 0 {
		return 0, fmt.Errorf("mascota no encontrada")
	}
	newStatus := 1
	if pet.StatusID == 1 {
		newStatus = 2
	}
	err := r.db.Model(&entities.Pet{}).Where("id = ?", id).Update("status_id", newStatus).Error
	if err != nil {
		return 0, err
	}
	return newStatus, nil
}
