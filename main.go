package main

import (
	"embed"
	"io/fs"
	"log"
	"os"
	"path/filepath"

	"github.com/owbird/resystor/cmd"
)

//go:embed all:frontend/out
var assets embed.FS

func main() {
	tempDir, err := os.MkdirTemp("", "resystor-")
	if err != nil {
		log.Fatal(err)
	}

	defer os.RemoveAll(tempDir)

	if err := fs.WalkDir(assets, ".", func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		outPath := filepath.Join(tempDir, path)

		if d.IsDir() {
			return os.MkdirAll(outPath, 0755)
		}
		data, err := assets.ReadFile(path)
		if err != nil {
			return err
		}
		return os.WriteFile(outPath, data, 0644)
	}); err != nil {
		log.Fatal(err)
	}

	cmd.Execute(tempDir)
}
