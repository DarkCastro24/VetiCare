package app

import (
	"VetiCare/data"
	"fmt"
	"github.com/gorilla/mux"
	"gorm.io/gorm"
	"log"
)

type App struct {
	Router *mux.Router
}

func InitApp() *App {
	return &App{
		Router: mux.NewRouter(),
	}
}

func (a *App) InitDB() *gorm.DB {
	if err := data.RunPostgresDB(); err != nil {
		log.Fatal("Error DB:", err)
	}
	fmt.Println("Conectado a PostgreSQL con GORM")
	db := data.DB
	return db
}
