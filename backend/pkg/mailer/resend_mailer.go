package mailer

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

const resendEndpoint = "https://api.resend.com/emails"

// ResendMailer delivers email through the Resend HTTP API (https://resend.com).
// It's intentionally minimal; swap in another provider by adding a sibling
// implementation of Mailer and updating New.
type ResendMailer struct {
	apiKey string
	from   string
	client *http.Client
}

func NewResendMailer(apiKey, from string) *ResendMailer {
	return &ResendMailer{
		apiKey: apiKey,
		from:   from,
		client: &http.Client{Timeout: 10 * time.Second},
	}
}

func (m *ResendMailer) Send(ctx context.Context, email Email) error {
	payload := map[string]any{
		"from":    m.from,
		"to":      []string{email.To},
		"subject": email.Subject,
		"text":    email.TextBody,
	}
	if email.HTMLBody != "" {
		payload["html"] = email.HTMLBody
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("mailer: marshal payload: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, resendEndpoint, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("mailer: build request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+m.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := m.client.Do(req)
	if err != nil {
		return fmt.Errorf("mailer: send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("mailer: provider returned status %d", resp.StatusCode)
	}
	return nil
}
