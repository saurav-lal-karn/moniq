package helper

import (
	"fmt"
	"strings"

	"github.com/go-playground/validator/v10"
)

func FormatValidationError(err error) string {
	var errMsgs []string

	if validationErrors, ok := err.(validator.ValidationErrors); ok {
		for _, e := range validationErrors {
			switch e.Tag() {
			case "required":
				errMsgs = append(errMsgs, fmt.Sprintf("%s is required", e.Field()))
			case "email":
				errMsgs = append(errMsgs, fmt.Sprintf("%s must be a valid email", e.Field()))
			case "min":
				errMsgs = append(errMsgs, fmt.Sprintf("%s must be at least %s characters", e.Field(), e.Param()))
			case "max":
				errMsgs = append(errMsgs, fmt.Sprintf("%s must be at most %s characters", e.Field(), e.Param()))
			default:
				errMsgs = append(errMsgs, fmt.Sprintf("%s is invalid", e.Field()))
			}
		}
		return strings.Join(errMsgs, ", ")
	}

	return err.Error()
}
