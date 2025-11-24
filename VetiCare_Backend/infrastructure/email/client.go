package email

type Client interface {
	Send(to, subject, body string) error
}
