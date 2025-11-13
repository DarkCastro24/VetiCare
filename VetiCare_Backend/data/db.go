package data

import (
	"VetiCare/entities"
	"errors"
	"fmt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"log"
	"os"
)

var DB *gorm.DB

func RunPostgresDB() error {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		return fmt.Errorf("la variable de entorno DATABASE_URL no está configurada")
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return fmt.Errorf("error al conectar a PostgreSQL: %w", err)
	}
	DB = db

	if err := runMigrations(db); err != nil {
		return fmt.Errorf("error en migraciones: %w", err)
	}

	if err := seedCatalogs(db); err != nil {
		log.Printf("ocurrio un error al poblar catálogos: %v\n", err)
	}

	return nil
}

func runMigrations(db *gorm.DB) error {
	return db.AutoMigrate(
		&entities.User{},
		&entities.Admin{},
		&entities.Pet{},
		&entities.Appointment{},
		&entities.AdminType{},
		&entities.UserRole{},
		&entities.Species{},
	)
}

func seedCatalogs(db *gorm.DB) error {
	// AdminTypes
	adminTypes := []entities.AdminType{
		{ID: 1, Type: "Root"},
		{ID: 2, Type: "Admin"},
	}
	for _, at := range adminTypes {
		var existing entities.AdminType
		result := db.First(&existing, "id = ?", at.ID)
		if result.Error != nil && errors.Is(result.Error, gorm.ErrRecordNotFound) {
			if err := db.Create(&at).Error; err != nil {
				log.Printf("Error insertando AdminType %v: %v\n", at, err)
			}
		}
	}

	// UserRoles
	userRoles := []entities.UserRole{
		{ID: 1, Role: "Dueño"},
		{ID: 2, Role: "Veterinario"},
	}
	for _, ur := range userRoles {
		var existing entities.UserRole
		result := db.First(&existing, "id = ?", ur.ID)
		if result.Error != nil && errors.Is(result.Error, gorm.ErrRecordNotFound) {
			if err := db.Create(&ur).Error; err != nil {
				log.Printf("Error insertando UserRole %v: %v\n", ur, err)
			}
		}
	}

	// Species
	species := []entities.Species{
		{ID: 1, Name: "Perro", ImageURL: "/images/species/perro.png"},
		{ID: 2, Name: "Gato", ImageURL: "/images/species/gato.png"},
		{ID: 3, Name: "Ave", ImageURL: "/images/species/ave.png"},
	}
	for _, sp := range species {
		var existing entities.Species
		result := db.First(&existing, "id = ?", sp.ID)
		if result.Error != nil && errors.Is(result.Error, gorm.ErrRecordNotFound) {
			if err := db.Create(&sp).Error; err != nil {
				log.Printf("Error insertando Species %v: %v\n", sp, err)
			}
		}
	}

	return nil
}
