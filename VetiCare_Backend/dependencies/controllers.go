package dependencies

import "VetiCare/controllers"

type Controllers struct {
	UserController        *controllers.UserController
	AdminController       *controllers.AdminController
	AppointmentController *controllers.AppointmentController
	PetController         *controllers.PetController
	AdminTypeController   *controllers.AdminTypeController
	UserRoleController    *controllers.UserRoleController
	SpeciesController     *controllers.SpeciesController
}
