package repositories

import (
	"errors"
	"fmt"

	"VetiCare/entities"
	"VetiCare/utils"
	"gorm.io/gorm"
)

type adminRepositoryGORM struct {
	db *gorm.DB
}

func NewAdminRepositoryGORM(db *gorm.DB) AdminRepository {
	return &adminRepositoryGORM{db: db}
}

func (r *adminRepositoryGORM) Create(a *entities.Admin) error {
	return r.db.Create(a).Error
}

func (r *adminRepositoryGORM) GetAll() ([]entities.Admin, error) {
	var list []entities.Admin
	err := r.db.Preload("AdminType").Find(&list).Error
	return list, err
}

func (r *adminRepositoryGORM) GetByID(id string) (*entities.Admin, error) {
	var a entities.Admin
	res := r.db.Preload("AdminType").First(&a, "id = ?", id)
	if errors.Is(res.Error, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &a, res.Error
}

func (r *adminRepositoryGORM) GetByEmail(email string) (*entities.Admin, error) {
	var a entities.Admin
	res := r.db.Preload("AdminType").First(&a, "email = ?", email)
	if errors.Is(res.Error, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &a, res.Error
}

func (r *adminRepositoryGORM) GetByUsername(username string) (*entities.Admin, error) {
	var a entities.Admin
	res := r.db.Preload("AdminType").First(&a, "username = ?", username)
	if errors.Is(res.Error, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &a, res.Error
}

func (r *adminRepositoryGORM) Update(id string, fields map[string]interface{}) error {
	if len(fields) == 0 {
		return nil
	}
	return r.db.Model(&entities.Admin{}).Where("id = ?", id).Updates(fields).Error
}

func (r *adminRepositoryGORM) Delete(id string) (int, error) {
	var admin entities.Admin
	result := r.db.First(&admin, "id = ?", id)
	if result.Error != nil {
		return 0, result.Error
	}
	if result.RowsAffected == 0 {
		return 0, fmt.Errorf("administrador no encontrado")
	}

	newStatus := 1
	if admin.StatusID == 1 {
		newStatus = 2
	}

	err := r.db.Model(&entities.Admin{}).Where("id = ?", id).Update("status_id", newStatus).Error
	if err != nil {
		return 0, err
	}

	return newStatus, nil
}

func (r *adminRepositoryGORM) ChangePassword(email, current, new string) error {
	admin, err := r.GetByEmail(email)
	if err != nil {
		return err
	}
	if admin == nil {
		return fmt.Errorf("administrador no encontrado")
	}
	if !utils.CheckPasswordHash(current, admin.PasswordHash) {
		return fmt.Errorf("contraseña actual incorrecta")
	}
	hash, err := utils.HashPassword(new)
	if err != nil {
		return err
	}
	return r.db.Model(admin).Update("password_hash", hash).Error
}
