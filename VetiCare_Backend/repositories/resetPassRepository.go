package repositories

import (
	"VetiCare/entities"
	"errors"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"time"
)

type tokenResetRepositoryGORM struct {
	db *gorm.DB
}

func NewTokenResetRepositoryGORM(db *gorm.DB) *tokenResetRepositoryGORM {
	return &tokenResetRepositoryGORM{
		db: db,
	}
}

func (r *tokenResetRepositoryGORM) Create(token *entities.PassResetToken) error {
	return r.db.Create(token).Error
}

func (r *tokenResetRepositoryGORM) Get(token string) (*entities.PassResetToken, error) {
	var t entities.PassResetToken
	if err := r.db.Where("token = ?", token).First(&t).Error; err != nil {
		return nil, err
	}
	if t.Used || t.ExpiresAt.Before(time.Now()) {
		return nil, errors.New("token vencido o usado previamente")
	}
	return &t, nil
}

func (r *tokenResetRepositoryGORM) MarkTokenUsed(id uuid.UUID) error {
	return r.db.Model(&entities.PassResetToken{}).
		Where("id = ?", id).
		Update("used", true).Error
}
