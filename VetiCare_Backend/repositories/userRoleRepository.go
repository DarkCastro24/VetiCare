package repositories

import (
	"VetiCare/entities"
	"errors"
	"gorm.io/gorm"
)

type userRoleRepositoryGORM struct {
	db *gorm.DB
}

func NewUserRoleRepositoryGORM(db *gorm.DB) UserRoleRepository {
	return &userRoleRepositoryGORM{db: db}
}

func (r *userRoleRepositoryGORM) GetAll() ([]entities.UserRole, error) {
	var list []entities.UserRole
	err := r.db.Find(&list).Error
	return list, err
}

func (r *userRoleRepositoryGORM) GetByID(id int) (*entities.UserRole, error) {
	var role entities.UserRole
	err := r.db.First(&role, "id = ?", id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &role, err
}

func (r *userRoleRepositoryGORM) Create(role *entities.UserRole) error {
	return r.db.Create(role).Error
}

func (r *userRoleRepositoryGORM) Update(id int, fields map[string]interface{}) error {
	return r.db.Model(&entities.UserRole{}).Where("id = ?", id).Updates(fields).Error
}

func (r *userRoleRepositoryGORM) Delete(id int) error {
	return r.db.Delete(&entities.UserRole{}, id).Error
}
