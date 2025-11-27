package utils

import (
	"time"

	"github.com/owbird/resystor/internal/data"
	"github.com/shirou/gopsutil/host"
)

func GetUptime() (data.UpTime, error) {
	uptime, err := host.Uptime()
	if err != nil {
		return data.UpTime{}, err
	}

	duration := time.Duration(uptime) * time.Second

	return data.UpTime{
		Days:    int(duration.Hours() / 24),
		Hours:   int(duration.Hours()) % 24,
		Minutes: int(duration.Minutes()) % 60,
	}, nil
}
