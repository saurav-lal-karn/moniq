// Package mailer provides a small, provider-agnostic email abstraction.
//
// Callers depend only on the Mailer interface. The concrete implementation is
// chosen at wiring time via New: when no API key is configured (local/dev) a
// LogMailer prints the message to the terminal; when an API key is present
// (prod) a real provider client is returned. Swapping providers means adding a
// new implementation of Mailer and a branch in New — nothing else changes.
package mailer

import "context"

// Email is a single outbound message. HTMLBody is optional; TextBody should
// always be set so the message is readable in plain-text clients and logs.
type Email struct {
	To       string
	Subject  string
	TextBody string
	HTMLBody string
}

// Mailer sends transactional email.
type Mailer interface {
	Send(ctx context.Context, email Email) error
}

// New returns a Mailer based on the supplied configuration. If apiKey is empty
// it returns a LogMailer (no email is actually sent — the message is logged).
// Otherwise it returns a provider-backed mailer that delivers real email.
func New(apiKey, from string) Mailer {
	if apiKey == "" {
		return &LogMailer{}
	}
	return NewResendMailer(apiKey, from)
}
