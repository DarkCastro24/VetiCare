package utils

import (
	"crypto/rand"
	"encoding/hex"
)

func GenerateSecureToken(length int) (string, error) {
	b := make([]byte, length)
	_, err := rand.Read(b)
	if err != nil {
		return "", nil
	}
	return hex.EncodeToString(b), nil
}
