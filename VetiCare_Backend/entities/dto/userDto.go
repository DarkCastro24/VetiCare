package dto

import "VetiCare/entities"

type UserRoleDTO struct {
	ID   int    `json:"id"`
	Role string `json:"role_name"`
}

type UserDTO struct {
	ID       string      `json:"id,omitempty"`
	FullName string      `json:"full_name" validate:"required,alphabetic"`
	DUI      string      `json:"dui" validate:"required,duiFormat"`
	Phone    string      `json:"phone" validate:"required,phoneFormat"`
	Email    string      `json:"email" validate:"required,emailFormat"`
	Password string      `json:"password_hash,omitempty"`
	RoleID   int         `json:"role_id"`
	StatusID int         `json:"status_id"`
	Role     UserRoleDTO `json:"role"`
}

type UserSummaryDTO struct {
	ID       string `json:"id"`
	FullName string `json:"full_name"`
	DUI      string `json:"dui"`
	Phone    string `json:"phone"`
}

func ToUserDTO(u *entities.User) UserDTO {
	if u == nil {
		return UserDTO{}
	}

	return UserDTO{
		ID:       u.ID.String(),
		FullName: u.FullName,
		DUI:      u.DUI,
		Phone:    u.Phone,
		Email:    u.Email,
		RoleID:   u.RoleID,
		StatusID: u.StatusID,
		Role: UserRoleDTO{
			ID:   u.Role.ID,
			Role: u.Role.Role,
		},
	}
}
