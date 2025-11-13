package utils

import (
	"fmt"
	"gopkg.in/gomail.v2"
	"os"
)

func SendMail(toEmail, subject, body string) error {
	from := os.Getenv("EMAIL_FROM")
	password := os.Getenv("EMAIL_PASS")
	smtpHost := "smtp.gmail.com"
	smtpPort := 587
	m := gomail.NewMessage()
	m.SetHeader("From", from)
	m.SetHeader("To", toEmail)
	m.SetHeader("Subject", subject)
	m.SetBody("text/plain", body)
	d := gomail.NewDialer(smtpHost, smtpPort, from, password)
	if err := d.DialAndSend(m); err != nil {
		return fmt.Errorf("error enviando el correo: %v", err)
	}
	return nil
}
