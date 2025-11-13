package repositories

import (
	"VetiCare/entities"
	"errors"
	"gorm.io/gorm"
)

type adminTypeRepositoryGORM struct {
	db *gorm.DB
}

func NewAdminTypeRepositoryGORM(db *gorm.DB) AdminTypeRepository {
	return &adminTypeRepositoryGORM{db: db}
}

func (r *adminTypeRepositoryGORM) GetAll() ([]entities.AdminType, error) {
	var list []entities.AdminType
	err := r.db.Find(&list).Error
	return list, err
}

func (r *adminTypeRepositoryGORM) GetByID(id int) (*entities.AdminType, error) {
	var at entities.AdminType
	err := r.db.First(&at, "id = ?", id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &at, err
}

func (r *adminTypeRepositoryGORM) Create(adminType *entities.AdminType) error {
	return r.db.Create(adminType).Error
}

func (r *adminTypeRepositoryGORM) Update(id int, fields map[string]interface{}) error {
	return r.db.Model(&entities.AdminType{}).Where("id = ?", id).Updates(fields).Error
}

func (r *adminTypeRepositoryGORM) Delete(id int) error {
	return r.db.Delete(&entities.AdminType{}, id).Error
}
