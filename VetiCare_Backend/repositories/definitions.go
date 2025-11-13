package repositories

import (
	"VetiCare/entities"
	"time"
)

type UserRepository interface {
	Register(user *entities.User) error
	Login(email, password string) (*entities.User, error)
	Create(user *entities.User) error
	GetByEmail(email string) (*entities.User, error)
	GetByRole(roleID int) ([]entities.User, error)
	GetByID(id string) (*entities.User, error)
	GetAll() ([]entities.User, error)
	Update(id string, fields map[string]interface{}) error
	Delete(id string) (int, error)
	ChangePassword(email, currentPassword, newPassword string) error
}

type AdminRepository interface {
	Create(admin *entities.Admin) error
	GetAll() ([]entities.Admin, error)
	GetByID(id string) (*entities.Admin, error)
	GetByEmail(email string) (*entities.Admin, error)
	Update(id string, fields map[string]interface{}) error
	Delete(id string) (int, error)
	ChangePassword(email, currentPassword, newPassword string) error
	GetByUsername(username string) (*entities.Admin, error)
}

type PetRepository interface {
	Create(pet *entities.Pet) error
	GetByID(id string) (*entities.Pet, error)
	GetAll() ([]entities.Pet, error)
	Update(id string, fields map[string]interface{}) error
	Delete(id string) (int, error)
	GetActivePets() ([]entities.Pet, error)
	GetPetsByOwner(ownerID string) ([]entities.Pet, error)
}

type SpeciesRepository interface {
	GetAll() ([]entities.Species, error)
	GetByID(id int) (*entities.Species, error)
	Create(species *entities.Species) error
	Update(id int, fields map[string]interface{}) error
	Delete(id int) error
}

type AppointmentRepository interface {
	Create(app *entities.Appointment) error
	GetByID(id string) (*entities.Appointment, error)
	GetAll() ([]entities.Appointment, error)
	Update(id string, fields map[string]interface{}) error
	Delete(id string) (int, error)
	UpdateStatus(id string, statusID int) error
	GetByUserID(userID string) ([]entities.Appointment, error)
	GetMedicalHistoryByPetID(petID string) ([]entities.Appointment, error)
	GetAppointmentsByStatus(statusID int) ([]entities.Appointment, error)
	GetAppointmentsByStatusAndDate(date time.Time) ([]entities.Appointment, error)
	ExistsAppointmentForPet(date, time string) (bool, error)

	CountAppointmentsByStatus(statusID int) (int, error)
	CountVets() (int, error)
	GetVetsWithMostAppointments(limit int) ([]entities.VetAppointments, error)
	CountAttendedByMonthLast6Months() ([]entities.MonthlyAppointments, error)
}

type AdminTypeRepository interface {
	GetAll() ([]entities.AdminType, error)
	GetByID(id int) (*entities.AdminType, error)
	Create(adminType *entities.AdminType) error
	Update(id int, fields map[string]interface{}) error
	Delete(id int) error
}

type UserRoleRepository interface {
	GetAll() ([]entities.UserRole, error)
	GetByID(id int) (*entities.UserRole, error)
	Create(role *entities.UserRole) error
	Update(id int, fields map[string]interface{}) error
	Delete(id int) error
}
