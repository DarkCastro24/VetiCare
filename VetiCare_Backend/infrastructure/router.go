package infrastructure

import (
	"VetiCare/dependencies"
	"VetiCare/middlewares"
)

func (a *App) InitRouter(c dependencies.Controllers) {
	r := a.Router
	c.UserController.RegisterRoutes(r, middlewares.JWTAuthMiddleware)
	c.AdminController.RegisterPublicRoutes(r, middlewares.AdminRegisterMiddleware)
	c.AdminController.RegisterProtectedRoutes(r, middlewares.AdminProtected)
	c.AppointmentController.RegisterRoutes(r, middlewares.JWTAuthMiddleware)
	c.PetController.RegisterRoutes(r, middlewares.JWTAuthMiddleware)
	c.AdminTypeController.RegisterRoutes(r, middlewares.AdminProtected)
	c.UserRoleController.RegisterRoutes(r, middlewares.JWTAuthMiddleware)
	c.SpeciesController.RegisterRoutes(r, middlewares.JWTAuthMiddleware)
}
