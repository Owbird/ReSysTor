package main

import (
	"embed"

	"github.com/owbird/resystor/cmd"
)

//go:embed all:frontend
var assets embed.FS

func main() {
	cmd.Execute()
}
