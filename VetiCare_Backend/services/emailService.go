package services

import (
	"VetiCare/entities/dto"
	email "VetiCare/infrastructure/email"
	"fmt"
)

type emailService struct {
	client email.Client
}

type EmailService interface {
	SendWelcomeEmail(to string, subject string, userInfo dto.WelcomeEmailUser) error
	SendPasswordResetEmail(to string, subject string, link string) error
}

func NewEmailService(client email.Client) EmailService {
	return &emailService{client: client}
}

func (s *emailService) SendWelcomeEmail(to string, subject string, userInfo dto.WelcomeEmailUser) error {
	body := fmt.Sprintf(
		"Hola %s,\n\nTe informamos que has sido registrado correctamente en el sistema, "+
			"tus credenciales asignadas son las siguientes, tienes la opción de cambiar tu contraseña en el sistema si así lo deseas.\n\nUsuario: %s\nContraseña: %s\n\nSaludos.",
		userInfo.FullName,
		userInfo.Email,
		userInfo.Password,
	)
	return s.client.Send(userInfo.Email, subject, body)
}

func (s *emailService) SendPasswordResetEmail(to string, subject string, link string) error {
	var body = fmt.Sprintf(
		"Hola ,\n\nHemos recibido una solicitud para restablecer tu contraseña. \nSi no realizaste esta petición,"+
			"puedes ignorar este mensaje. \n\n "+
			"Para continuar con el proceso, utiliza el siguiente enlace proporcionado por el sistema: \n\n"+
			"Enlace de restablecimiento: %s \n\n"+
			"Si encuentras algún inconveniente, no dudes en contactarnos.\n\n"+
			"Saludos",
		link,
	)
	return s.client.Send(to, subject, body)
}
