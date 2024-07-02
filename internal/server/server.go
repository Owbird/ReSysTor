// Package server handles the file hosting server
package server

import (
	"bufio"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"

	"github.com/owbird/resystor/internal/monitor"
	"github.com/rs/cors"
	"github.com/spf13/viper"
)

type Config struct {
	Name     string
	Interval int
}

type Server struct {
	Config  Config
	Monitor *monitor.Monitor
}

const (
	PORT = 8080
)

func runCmd(cmd string, args ...string) error {
	command := exec.Command(cmd, args...)

	stdout, err := command.StdoutPipe()
	if err != nil {
		return err
	}

	stderr, err := command.StderrPipe()
	if err != nil {
		return err
	}

	if err := command.Start(); err != nil {
		return err
	}

	scanOutput := func(pipe *bufio.Scanner) {
		for pipe.Scan() {
			line := pipe.Text()

			fmt.Println(line)
		}
	}

	stdoutScanner := bufio.NewScanner(stdout)
	stderrScanner := bufio.NewScanner(stderr)

	go scanOutput(stdoutScanner)
	go scanOutput(stderrScanner)

	if err := command.Wait(); err != nil {
		return err
	}

	return nil
}

func NewServer() *Server {
	go runCmd("npm", "run", "build:start", "--prefix", "frontend")

	viper.SetConfigName("resystor")
	viper.SetConfigType("toml")

	configDir, err := os.UserConfigDir()
	if err != nil {
		log.Fatalln(err)
	}

	viper.AddConfigPath(configDir)

	hostname, err := os.Hostname()
	if err != nil {
		log.Fatalln(err)
	}

	viper.SetDefault("name", fmt.Sprintf("%v's Server", hostname))
	viper.SetDefault("interval", 5)

	err = viper.ReadInConfig()
	if err != nil {
		viper.SafeWriteConfig()
	}

	var config Config

	viper.Unmarshal(&config)

	return &Server{
		Config:  config,
		Monitor: monitor.NewMonitor(),
	}
}

func (s *Server) getServerConfig(w http.ResponseWriter, _ *http.Request) {
	configJson, err := json.Marshal(s.Config)
	if err != nil {
		http.Error(w, "Failed to get server", http.StatusInternalServerError)
		return
	}

	w.Write(configJson)
	return
}

func (s *Server) getStats(w http.ResponseWriter, r *http.Request) {
	resources, _ := s.Monitor.GetSystemResources()
	processes, _ := s.Monitor.GetSystemProcesses()
	fileSystems, _ := s.Monitor.GetFileSystems()

	json, _ := json.Marshal(map[string]interface{}{
		"resources":   resources,
		"processes":   processes,
		"filesystems": fileSystems,
	})

	w.Write(json)
}

// Starts starts and serves the specified dir
func (s *Server) Start() {
	mux := http.NewServeMux()

	mux.HandleFunc("/", s.getStats)
	mux.HandleFunc("/config", s.getServerConfig)

	corsOpts := cors.New(cors.Options{
		AllowedOrigins: []string{"https://*.loca.lt", "http://localhost:3000", "http://localhost:3001"},
		AllowedMethods: []string{
			http.MethodGet,
			http.MethodOptions,
			http.MethodHead,
		},

		AllowedHeaders: []string{
			"*",
		},
	})

	err := http.ListenAndServe(fmt.Sprintf(":%v", PORT), corsOpts.Handler(mux))
	if err != nil {
		log.Fatalln(err)
	}
}
