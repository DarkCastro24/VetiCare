package email

import (
	"fmt"
	"gopkg.in/gomail.v2"
	"os"
)

type SMTPClient struct {
	Host     string
	Port     int
	User     string
	Password string
}

func NewSMTPClient() *SMTPClient {
	return &SMTPClient{Host: "smtp.gmail.com", Port: 587, User: os.Getenv("email_from"), Password: os.Getenv("EMAIL_PASS")}
}

func (c *SMTPClient) Send(toEmail, subject, body string) error {
	m := gomail.NewMessage()
	m.SetHeader("From", c.User)
	m.SetHeader("To", toEmail)
	m.SetHeader("Subject", subject)
	m.SetBody("text/plain", body)
	d := gomail.NewDialer(c.Host, c.Port, c.User, c.Password)
	if err := d.DialAndSend(m); err != nil {
		return fmt.Errorf("error enviando el correo: %v", err)
	}
	return nil
}
