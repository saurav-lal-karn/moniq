package helper

import (
	"encoding/json"
	"time"
)

type Date struct {
	time.Time
}

func (d Date) MarshalText() ([]byte, error) {
	return []byte(d.Format("2006-01-02")), nil
}

// UnmarshalJSON accepts the date-only format used by transaction requests.
// Without this method, the embedded time.Time unmarshaler is selected and
// rejects values such as "2026-01-20" because it expects an RFC 3339 timestamp.
func (d *Date) UnmarshalJSON(data []byte) error {
	var value string
	if err := json.Unmarshal(data, &value); err != nil {
		return err
	}

	return d.UnmarshalText([]byte(value))
}

func (d *Date) UnmarshalText(text []byte) error {
	t, err := time.Parse("2006-01-02", string(text))
	if err != nil {
		return err
	}

	d.Time = t
	return nil
}

type PaginationRequest struct {
	Page int `form:"page"`
	Limit int `form:"limit"`
	Offset int `form:"offset"`
	Search string `form:"search"`
	Sort string `form:"sort"`
	Order string `form:"order"`
	Filters map[string]string `form:"filters"`
}

type PaginationResponse struct {
	Page int `json:"page"`
	Limit int `json:"limit"`
	Total int `json:"total"`
	TotalPages int `json:"total_pages"`
}
