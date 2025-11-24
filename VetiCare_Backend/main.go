package main

import (
	"VetiCare/dependencies"
	"VetiCare/infrastructure"
	"fmt"

	"github.com/joho/godotenv"
	"github.com/rs/cors"
	"log"
	"net/http"
)

func main() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Println("Error al cargar .env:", err)
	}

	application := infrastructure.InitApp()
	db := application.InitDB()
	deps := dependencies.BuildDeps(db)
	application.InitRouter(deps)

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type", "X-Admin-Secret"},
		AllowCredentials: true,
	})

	handler := c.Handler(application.Router)

	fmt.Println("Servidor en http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}
