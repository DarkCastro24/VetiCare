package controllers

import (
	"VetiCare/entities"
	"VetiCare/entities/dto"
	"VetiCare/services"
	"VetiCare/validators"
	"encoding/json"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"net/http"
	"strconv"
	"time"
)

type AppointmentController struct {
	Service *services.AppointmentService
}

func NewAppointmentController(service *services.AppointmentService) *AppointmentController {
	return &AppointmentController{Service: service}
}

func (ac *AppointmentController) RegisterRoutes(r *mux.Router, authMiddleware func(http.Handler) http.Handler) {
	r.Handle("/api/appointments", authMiddleware(http.HandlerFunc(ac.CreateAppointment))).Methods("POST")
	r.Handle("/api/appointments", authMiddleware(http.HandlerFunc(ac.GetAllAppointments))).Methods("GET")
	r.Handle("/api/appointments/active", authMiddleware(http.HandlerFunc(ac.GetActiveAppointments))).Methods("GET")
	r.Handle("/api/appointments/{id}/status/{status_id}", authMiddleware(http.HandlerFunc(ac.UpdateStatus))).Methods("PATCH")
	r.Handle("/api/appointments/{id}", authMiddleware(http.HandlerFunc(ac.GetAppointmentByID))).Methods("GET")
	r.Handle("/api/appointments/{id}", authMiddleware(http.HandlerFunc(ac.UpdateAppointment))).Methods("PUT")
	r.Handle("/api/appointments/{id}", authMiddleware(http.HandlerFunc(ac.DeleteAppointment))).Methods("DELETE")
	r.Handle("/api/appointments/user/{user_id}", authMiddleware(http.HandlerFunc(ac.GetAppointmentsByUser))).Methods("GET")
	r.Handle("/api/appointments/pet/{pet_id}/history", authMiddleware(http.HandlerFunc(ac.GetMedicalHistoryByPet))).Methods("GET")

	// DASHBOARD ROUTES
	r.Handle("/api/dashboard/appointments/attended", authMiddleware(http.HandlerFunc(ac.GetCountAttendedAppointments))).Methods("GET")
	r.Handle("/api/dashboard/appointments/pending", authMiddleware(http.HandlerFunc(ac.GetCountPendingAppointments))).Methods("GET")
	r.Handle("/api/dashboard/vets/total", authMiddleware(http.HandlerFunc(ac.GetTotalVets))).Methods("GET")
	r.Handle("/api/dashboard/vets/top", authMiddleware(http.HandlerFunc(ac.GetTopVets))).Methods("GET")
	r.Handle("/api/dashboard/appointments/monthly_last6months", authMiddleware(http.HandlerFunc(ac.GetAppointmentsByMonthLast6Months))).Methods("GET")
}

func (ac *AppointmentController) CreateAppointment(w http.ResponseWriter, r *http.Request) {
	var app dto.AppointmentDTO
	var vetUUID *uuid.UUID

	if err := json.NewDecoder(r.Body).Decode(&app); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	duplicate, err := ac.Service.ExistsAppointmentForPet(app.Date, app.Time)
	if err != nil {
		http.Error(w, "Error validando duplicidad: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if duplicate {
		http.Error(w, "Ya existe una cita registrada para esa fecha y hora", http.StatusBadRequest)
		return
	}

	if app.VetID != nil && *app.VetID != "" {
		parsedUUID, err := uuid.Parse(*app.VetID)
		if err != nil {
			http.Error(w, "Error al parsear veterinario", http.StatusBadRequest)
			return
		}
		vetUUID = &parsedUUID
	}

	appointment := entities.Appointment{
		PetID: uuid.MustParse(app.PetID),
		Date:  app.Date,
		Time:  app.Time,
		VetID: vetUUID,
	}
	if err := ac.Service.CreateAppointment(&appointment); err != nil {
		http.Error(w, "Error creando cita: "+err.Error(), http.StatusInternalServerError)
		return
	}
	completeApp, err := ac.Service.GetAppointmentByID(appointment.ID.String())
	if err != nil {
		http.Error(w, "Error obteniendo cita creada: "+err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(dto.NewAppointmentDTO(completeApp))
}

func (ac *AppointmentController) GetAllAppointments(w http.ResponseWriter, _ *http.Request) {
	list, err := ac.Service.GetAllAppointments()
	if err != nil {
		http.Error(w, "Error al obtener citas: "+err.Error(), http.StatusInternalServerError)
		return
	}
	var dtos []dto.AppointmentDTO
	for _, app := range list {
		dtos = append(dtos, dto.NewAppointmentDTO(&app))
	}
	json.NewEncoder(w).Encode(dtos)
}

func (ac *AppointmentController) GetAppointmentByID(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]

	app, err := ac.Service.GetAppointmentByID(id)
	if err != nil {
		http.Error(w, "Error al obtener cita: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if app == nil {
		http.Error(w, "Cita no encontrada", http.StatusNotFound)
		return
	}

	appointmentDTO := dto.NewAppointmentDTO(app)
	json.NewEncoder(w).Encode(appointmentDTO)
}

func (ac *AppointmentController) GetActiveAppointments(w http.ResponseWriter, r *http.Request) {
	dateStr := r.URL.Query().Get("date")
	var apps []entities.Appointment
	var err error

	if dateStr != "" {
		date, errParse := time.Parse("02-01-2006", dateStr)
		if errParse != nil {
			http.Error(w, "Fecha inválida, use formato DD-MM-YYYY", http.StatusBadRequest)
			return
		}
		apps, err = ac.Service.GetAppointmentsByStatusAndDate(date)
	} else {
		apps, err = ac.Service.GetAppointmentsByStatus(1)
	}

	if err != nil {
		http.Error(w, "Error obteniendo citas activas: "+err.Error(), http.StatusInternalServerError)
		return
	}

	var dtos []dto.AppointmentDTO
	for _, app := range apps {
		dtos = append(dtos, dto.NewAppointmentDTO(&app))
	}

	json.NewEncoder(w).Encode(dtos)
}

func (ac *AppointmentController) GetMedicalHistoryByPet(w http.ResponseWriter, r *http.Request) {
	petID := mux.Vars(r)["pet_id"]

	apps, err := ac.Service.GetMedicalHistoryByPetID(petID)
	if err != nil {
		http.Error(w, "Error obteniendo historial médico: "+err.Error(), http.StatusInternalServerError)
		return
	}

	var dtos []dto.AppointmentDTO
	for _, app := range apps {
		dtos = append(dtos, dto.NewAppointmentDTO(&app))
	}

	json.NewEncoder(w).Encode(dtos)
}

func (ac *AppointmentController) GetAppointmentsByUser(w http.ResponseWriter, r *http.Request) {
	userID := mux.Vars(r)["user_id"]

	apps, err := ac.Service.GetByUserID(userID)
	if err != nil {
		http.Error(w, "Error obteniendo citas: "+err.Error(), http.StatusInternalServerError)
		return
	}

	var dtos []dto.AppointmentDTO
	for _, app := range apps {
		dtos = append(dtos, dto.NewAppointmentDTO(&app))
	}

	json.NewEncoder(w).Encode(dtos)
}

func (ac *AppointmentController) UpdateAppointment(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	var fields map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&fields); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	var appDTO dto.AppointmentDTO

	if val, ok := fields["pet_id"]; ok {
		if str, ok := val.(string); ok {
			appDTO.PetID = str
		}
	}
	if val, ok := fields["vet_id"]; ok {
		if str, ok := val.(string); ok {
			appDTO.VetID = &str
		}
	}
	if val, ok := fields["date"]; ok {
		if str, ok := val.(string); ok {
			appDTO.Date = str
		}
	}
	if val, ok := fields["time"]; ok {
		if str, ok := val.(string); ok {
			appDTO.Time = str
		}
	}
	if val, ok := fields["status_id"]; ok {
		if v, ok := val.(float64); ok {
			appDTO.StatusID = int(v)
		}
	}
	if val, ok := fields["weight_kg"]; ok {
		if v, ok := val.(float64); ok {
			appDTO.WeightKg = &v
		}
	}
	if val, ok := fields["temperature"]; ok {
		if v, ok := val.(float64); ok {
			appDTO.Temperature = &v
		}
	}
	if val, ok := fields["reason"]; ok {
		if str, ok := val.(string); ok {
			appDTO.Reason = str
		}
	}
	if val, ok := fields["vaccination_status"]; ok {
		if str, ok := val.(string); ok {
			appDTO.VaccinationStatus = str
		}
	}
	if val, ok := fields["medications_prescribed"]; ok {
		if str, ok := val.(string); ok {
			appDTO.MedicationsPrescribed = str
		}
	}
	if val, ok := fields["additional_notes"]; ok {
		if str, ok := val.(string); ok {
			appDTO.AdditionalNotes = str
		}
	}

	if err := validators.ValidateAppointmentDTO(appDTO); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := ac.Service.UpdateAppointment(id, fields); err != nil {
		http.Error(w, "Error al actualizar cita: "+err.Error(), http.StatusInternalServerError)
		return
	}

	app, err := ac.Service.GetAppointmentByID(id)
	if err != nil {
		http.Error(w, "Error al obtener cita actualizada: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if app == nil {
		http.Error(w, "Cita no encontrada", http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(dto.NewAppointmentDTO(app))
}

func (ac *AppointmentController) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	appointmentID := vars["id"]
	statusIDStr := vars["status_id"]

	statusID, err := strconv.Atoi(statusIDStr)
	if err != nil {
		http.Error(w, "status_id inválido", http.StatusBadRequest)
		return
	}

	if statusID < 1 || statusID > 3 {
		http.Error(w, "status_id debe ser 1, 2 o 3", http.StatusBadRequest)
		return
	}

	err = ac.Service.UpdateStatus(appointmentID, statusID)
	if err != nil {
		http.Error(w, "Error actualizando estado: "+err.Error(), http.StatusInternalServerError)
		return
	}

	updatedApp, err := ac.Service.GetAppointmentByID(appointmentID)
	if err != nil || updatedApp == nil {
		http.Error(w, "Error obteniendo cita actualizada", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(dto.NewAppointmentDTO(updatedApp))
}

func (ac *AppointmentController) DeleteAppointment(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	msg, err := ac.Service.DeleteAppointment(id)
	if err != nil {
		http.Error(w, "Error al eliminar cita: "+err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"message": msg})
}

func (ac *AppointmentController) GetCountAttendedAppointments(w http.ResponseWriter, r *http.Request) {
	count, err := ac.Service.CountAppointmentsByStatus(2) // Status 2 = atendidas
	if err != nil {
		http.Error(w, "Error obteniendo citas atendidas: "+err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]int{"attended_appointments": count})
}

func (ac *AppointmentController) GetCountPendingAppointments(w http.ResponseWriter, r *http.Request) {
	count, err := ac.Service.CountAppointmentsByStatus(1) // Status 1 = pendientes
	if err != nil {
		http.Error(w, "Error obteniendo citas pendientes: "+err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]int{"pending_appointments": count})
}

func (ac *AppointmentController) GetTotalVets(w http.ResponseWriter, r *http.Request) {
	count, err := ac.Service.CountVets()
	if err != nil {
		http.Error(w, "Error obteniendo veterinarios: "+err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]int{"total_vets": count})
}

func (ac *AppointmentController) GetTopVets(w http.ResponseWriter, r *http.Request) {
	vets, err := ac.Service.GetVetsWithMostAppointments(5)
	if err != nil {
		http.Error(w, "Error obteniendo veterinarios con más citas: "+err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(vets)
}

func (ac *AppointmentController) GetAppointmentsByMonthLast6Months(w http.ResponseWriter, r *http.Request) {
	results, err := ac.Service.CountAttendedByMonthLast6Months()
	if err != nil {
		http.Error(w, "Error obteniendo citas por mes: "+err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(results)
}
