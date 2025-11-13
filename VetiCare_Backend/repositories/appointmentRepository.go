package repositories

import (
	"VetiCare/entities"
	"errors"
	"time"

	"gorm.io/gorm"
)

type appointmentRepositoryGORM struct {
	db *gorm.DB
}

func NewAppointmentRepositoryGORM(db *gorm.DB) AppointmentRepository {
	return &appointmentRepositoryGORM{db: db}
}

func (r *appointmentRepositoryGORM) Create(app *entities.Appointment) error {
	return r.db.Create(app).Error
}

func (r *appointmentRepositoryGORM) GetByID(id string) (*entities.Appointment, error) {
	var app entities.Appointment
	err := r.db.
		Preload("Pet").
		Preload("Pet.Owner").
		Preload("Pet.Species").
		Preload("Vet").
		Preload("Vet.Role").
		Where("id = ?", id).
		First(&app).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &app, err
}

func (r *appointmentRepositoryGORM) GetByUserID(userID string) ([]entities.Appointment, error) {
	var apps []entities.Appointment
	err := r.db.Joins("JOIN pets ON pets.id = appointments.pet_id").
		Where("pets.owner_id = ?", userID).
		Preload("Pet").
		Preload("Pet.Owner").
		Preload("Pet.Species").
		Preload("Vet").
		Preload("Vet.Role").
		Find(&apps).Error
	return apps, err
}

func (r *appointmentRepositoryGORM) GetAll() ([]entities.Appointment, error) {
	var apps []entities.Appointment
	err := r.db.
		Preload("Pet").
		Preload("Pet.Owner").
		Preload("Pet.Species").
		Preload("Vet").
		Preload("Vet.Role").
		Find(&apps).Error
	return apps, err
}

func (r *appointmentRepositoryGORM) GetAppointmentsByStatus(statusID int) ([]entities.Appointment, error) {
	var apps []entities.Appointment
	err := r.db.
		Where("status_id = ?", statusID).
		Preload("Pet").
		Preload("Pet.Owner").
		Preload("Pet.Species").
		Preload("Vet").
		Preload("Vet.Role").
		Find(&apps).Error
	return apps, err
}

func (r *appointmentRepositoryGORM) GetAppointmentsByStatusAndDate(date time.Time) ([]entities.Appointment, error) {
	var apps []entities.Appointment
	dateStr := date.Format("02-01-2006")
	err := r.db.
		Where("(status_id = 1 or status_id = 2) AND date = ?", dateStr).
		Preload("Pet").
		Preload("Pet.Owner").
		Preload("Pet.Species").
		Preload("Vet").
		Preload("Vet.Role").
		Find(&apps).Error
	return apps, err
}

func (r *appointmentRepositoryGORM) GetMedicalHistoryByPetID(petID string) ([]entities.Appointment, error) {
	var apps []entities.Appointment
	err := r.db.Where("pet_id = ? AND status_id = ?", petID, 2).
		Preload("Pet").
		Preload("Pet.Owner").
		Preload("Pet.Species").
		Preload("Vet").
		Preload("Vet.Role").
		Find(&apps).Error
	return apps, err
}

func (r *appointmentRepositoryGORM) Update(id string, fields map[string]interface{}) error {
	if len(fields) == 0 {
		return nil
	}
	return r.db.Model(&entities.Appointment{}).Where("id = ?", id).Updates(fields).Error
}

func (r *appointmentRepositoryGORM) UpdateStatus(id string, statusID int) error {
	return r.db.Model(&entities.Appointment{}).
		Where("id = ?", id).
		Update("status_id", statusID).Error
}

func (r *appointmentRepositoryGORM) Delete(id string) (int, error) {
	var app entities.Appointment
	result := r.db.First(&app, "id = ?", id)
	if result.Error != nil {
		return 0, result.Error
	}
	if result.RowsAffected == 0 {
		return 0, errors.New("cita no encontrada")
	}
	newStatus := 1
	if app.StatusID == 1 {
		newStatus = 2
	}
	err := r.db.Model(&entities.Appointment{}).Where("id = ?", id).Update("status_id", newStatus).Error
	if err != nil {
		return 0, err
	}
	return newStatus, nil
}

func (r *appointmentRepositoryGORM) CountAppointmentsByStatus(statusID int) (int, error) {
	var count int64
	err := r.db.Model(&entities.Appointment{}).Where("status_id = ?", statusID).Count(&count).Error
	return int(count), err
}

func (r *appointmentRepositoryGORM) CountVets() (int, error) {
	var count int64
	err := r.db.Model(&entities.User{}).
		Where("role_id = ? AND status_id = ?", 2, 1).Count(&count).Error // 2 = vet, 1 = activo
	return int(count), err
}

func (r *appointmentRepositoryGORM) GetVetsWithMostAppointments(limit int) ([]entities.VetAppointments, error) {
	var results []entities.VetAppointments
	err := r.db.Table("appointments a").
		Select("a.vet_id as vet_id, u.full_name as vet_name, count(a.id) as appointments").
		Joins("left join users u on a.vet_id = u.id").
		Where("a.vet_id IS NOT NULL").
		Group("a.vet_id, u.full_name").
		Order("appointments desc").
		Limit(limit).
		Scan(&results).Error
	return results, err
}

func (r *appointmentRepositoryGORM) CountAttendedByMonthLast6Months() ([]entities.MonthlyAppointments, error) {
	var results []entities.MonthlyAppointments
	sixMonthsAgo := time.Now().AddDate(0, -6, 0)
	err := r.db.
		Model(&entities.Appointment{}).
		Select(`EXTRACT(YEAR FROM TO_DATE(date, 'DD-MM-YYYY')) AS year,
				EXTRACT(MONTH FROM TO_DATE(date, 'DD-MM-YYYY')) AS month,
				COUNT(*) AS count`).
		Where("TO_DATE(date, 'DD-MM-YYYY') >= ? AND status_id = ?", sixMonthsAgo, 2).
		Group("year, month").
		Order("year DESC, month DESC").
		Scan(&results).Error

	return results, err
}

func (r *appointmentRepositoryGORM) ExistsAppointmentForPet(date, time string) (bool, error) {
	var count int64
	err := r.db.
		Model(&entities.Appointment{}).
		Where("date = ? AND time = ?", date, time).
		Count(&count).Error
	return count > 0, err
}
