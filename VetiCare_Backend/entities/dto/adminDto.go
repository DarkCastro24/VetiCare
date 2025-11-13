package dto

import "VetiCare/entities"

type AdminTypeDTO struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}
type AdminDTO struct {
	ID          string       `json:"id,omitempty"`
	FullName    string       `json:"full_name"`
	Username    string       `json:"username"`
	DUI         string       `json:"dui"`
	Email       string       `json:"email"`
	Phone       string       `json:"phone"`
	StatusID    int          `json:"status_id"`
	AdminTypeID int          `json:"admin_type_id"`
	AdminType   AdminTypeDTO `json:"admin_type"`
}
type AdminRegisterDTO struct {
	FullName    string `json:"full_name"`
	Username    string `json:"username"`
	DUI         string `json:"dui"`
	Email       string `json:"email"`
	Phone       string `json:"phone"`
	Password    string `json:"password"`
	StatusID    int    `json:"status_id"`
	AdminTypeID int    `json:"admin_type_id"`
}

func ToAdminDTO(a *entities.Admin) AdminDTO {
	return AdminDTO{
		ID:          a.ID.String(),
		FullName:    a.FullName,
		Username:    a.Username,
		DUI:         a.DUI,
		Email:       a.Email,
		Phone:       a.Phone,
		StatusID:    a.StatusID,
		AdminTypeID: a.AdminTypeID,
		AdminType: AdminTypeDTO{
			ID:   a.AdminType.ID,
			Name: a.AdminType.Type,
		},
	}
}
