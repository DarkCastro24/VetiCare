package dependencies

import (
	"VetiCare/controllers"
	"VetiCare/repositories"
	"VetiCare/services"
	"gorm.io/gorm"
)

func BuildDeps(db *gorm.DB) Controllers {
	
	userRepo := repositories.NewUserRepositoryGORM(db)
	adminRepo := repositories.NewAdminRepositoryGORM(db)
	appointmentRepo := repositories.NewAppointmentRepositoryGORM(db)
	petRepo := repositories.NewPetRepositoryGORM(db)
	adminTypeRepo := repositories.NewAdminTypeRepositoryGORM(db)
	userRoleRepo := repositories.NewUserRoleRepositoryGORM(db)
	speciesRepo := repositories.NewSpeciesRepositoryGORM(db)

	userService := services.NewUserService(userRepo)
	adminService := services.NewAdminService(adminRepo)
	appointmentService := services.NewAppointmentService(appointmentRepo)
	petService := services.NewPetService(petRepo)
	adminTypeService := services.NewAdminTypeService(adminTypeRepo)
	userRoleService := services.NewUserRoleService(userRoleRepo)
	speciesService := services.NewSpeciesService(speciesRepo)

	return Controllers{
		UserController:        controllers.NewUserController(userService),
		AdminController:       controllers.NewAdminController(adminService),
		AppointmentController: controllers.NewAppointmentController(appointmentService),
		PetController:         controllers.NewPetController(petService),
		AdminTypeController:   controllers.NewAdminTypeController(adminTypeService),
		UserRoleController:    controllers.NewUserRoleController(userRoleService),
		SpeciesController:     controllers.NewSpeciesController(speciesService),
	}
}
