package cmd

import (
	"os"

	"github.com/owbird/resystor/internal/server"
	"github.com/spf13/cobra"
)

var currentDir string

// rootCmd represents the base command when called without any subcommands
var rootCmd = &cobra.Command{
	Use:   "resystor",
	Short: "A simple Remote System Monitor Tool",
	Long:  `Remotely manage a system by handling running processes and viewing system stats`,
	Run: func(cmd *cobra.Command, args []string) {
		server := server.NewServer(currentDir)
		server.Start()
	},
}

func Execute(dir string) {
	currentDir = dir
	err := rootCmd.Execute()
	if err != nil {
		os.Exit(1)
	}
}

func init() {
}
