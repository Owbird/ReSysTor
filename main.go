package main

import (
	"github.com/owbird/raijin/pkg/app"
	"github.com/owbird/resystor/internal/monitor"
)

func main() {
	a := app.NewApp()

	a.Bind(monitor.NewMonitor())

	a.Run()
}
