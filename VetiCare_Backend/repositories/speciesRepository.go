package repositories

import (
	"VetiCare/entities"
	"errors"
	"gorm.io/gorm"
)

type speciesRepositoryGORM struct {
	db *gorm.DB
}

func NewSpeciesRepositoryGORM(db *gorm.DB) SpeciesRepository {
	return &speciesRepositoryGORM{db: db}
}

func (r *speciesRepositoryGORM) GetAll() ([]entities.Species, error) {
	var list []entities.Species
	err := r.db.Find(&list).Error
	return list, err
}

func (r *speciesRepositoryGORM) GetByID(id int) (*entities.Species, error) {
	var s entities.Species
	err := r.db.First(&s, "id = ?", id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &s, err
}

func (r *speciesRepositoryGORM) Create(species *entities.Species) error {
	return r.db.Create(species).Error
}

func (r *speciesRepositoryGORM) Update(id int, fields map[string]interface{}) error {
	return r.db.Model(&entities.Species{}).Where("id = ?", id).Updates(fields).Error
}

func (r *speciesRepositoryGORM) Delete(id int) error {
	return r.db.Delete(&entities.Species{}, id).Error
}
