package repositories

import (
	"VetiCare/entities"
	"VetiCare/utils"
	"errors"
	"fmt"
	"gorm.io/gorm"
)

type userRepositoryGORM struct {
	db *gorm.DB
}

func NewUserRepositoryGORM(db *gorm.DB) UserRepository {
	return &userRepositoryGORM{db: db}
}

func (r *userRepositoryGORM) Create(user *entities.User) error {
	return r.db.Create(user).Error
}

func (r *userRepositoryGORM) GetByID(id string) (*entities.User, error) {
	var u entities.User
	result := r.db.Preload("Role").Where("id = ?", id).First(&u)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &u, result.Error
}

func (r *userRepositoryGORM) GetByEmail(email string) (*entities.User, error) {
	var u entities.User
	result := r.db.Preload("Role").Where("email = ?", email).First(&u)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &u, result.Error
}

func (r *userRepositoryGORM) GetByRole(roleID int) ([]entities.User, error) {
	var users []entities.User
	result := r.db.Preload("Role").Where("role_id = ? AND status_id = ?", roleID, 1).Find(&users)
	return users, result.Error
}

func (r *userRepositoryGORM) GetAll() ([]entities.User, error) {
	var users []entities.User
	result := r.db.Preload("Role").Find(&users)
	return users, result.Error
}

func (r *userRepositoryGORM) Update(id string, fields map[string]interface{}) error {
	if len(fields) == 0 {
		return nil
	}
	return r.db.Model(&entities.User{}).Where("id = ?", id).Updates(fields).Error
}

func (r *userRepositoryGORM) UpdateToken(userID, token string) error {
	result := r.db.Model(&entities.User{}).Where("id = ?", userID).
		Updates(map[string]interface{}{"token": token})
	return result.Error
}

func (r *userRepositoryGORM) Delete(id string) (int, error) {
	var user entities.User
	result := r.db.First(&user, "id = ?", id)
	if result.Error != nil {
		return 0, result.Error
	}
	if result.RowsAffected == 0 {
		return 0, fmt.Errorf("usuario no encontrado")
	}

	newStatus := 1
	if user.StatusID == 1 {
		newStatus = 2
	}

	err := r.db.Model(&entities.User{}).Where("id = ?", id).Update("status_id", newStatus).Error
	if err != nil {
		return 0, err
	}

	return newStatus, nil
}

func (r *userRepositoryGORM) Register(user *entities.User) error {
	return r.db.Create(user).Error
}

func (r *userRepositoryGORM) Login(email, password string) (*entities.User, error) {
	var user entities.User
	err := r.db.Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}

	if !utils.CheckPasswordHash(password, user.PasswordHash) {
		return nil, fmt.Errorf("contraseña incorrecta")
	}
	return &user, nil
}

func (r *userRepositoryGORM) ChangePassword(email, currentPassword, newPassword string) error {
	var user entities.User
	err := r.db.Where("email = ?", email).First(&user).Error
	if err != nil {
		return fmt.Errorf("usuario no encontrado")
	}

	if !utils.CheckPasswordHash(currentPassword, user.PasswordHash) {
		return fmt.Errorf("la contraseña actual es incorrecta")
	}

	hashedPassword, err := utils.HashPassword(newPassword)
	if err != nil {
		return fmt.Errorf("error al hashear la nueva contraseña: %v", err)
	}

	user.PasswordHash = hashedPassword
	return r.db.Save(&user).Error
}
