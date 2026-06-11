package mailer

import (
	"context"

	"github.com/saurav-lal-karn/moniq/backend/pkg/logger"
)

// LogMailer is the default mailer for local development. It does not send any
// email — it logs the recipient, subject and body so links (e.g. an email
// verification URL) can be copied straight from the terminal.
type LogMailer struct{}

func (m *LogMailer) Send(_ context.Context, email Email) error {
	logger.Info("📧 [LogMailer] email not sent (no API key configured) — logging instead",
		logger.StringField("to", email.To),
		logger.StringField("subject", email.Subject),
		logger.StringField("body", email.TextBody),
	)
	return nil
}
