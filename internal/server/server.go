package server

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"strings"
	"time"

	"github.com/owbird/resystor/internal/monitor"
	"github.com/rs/cors"
	"github.com/spf13/viper"
)

type Config struct {
	Name     string `json:"name"`
	Interval int    `json:"interval"`
}

type Server struct {
	Config  Config
	Monitor *monitor.Monitor
}

const (
	PORT = 8080
)

func NewServer(currentDir string) *Server {
	cmd := exec.Command("npx", "--yes", "serve", "-s", fmt.Sprintf("%v/frontend/out", currentDir))

	var stdBuffer bytes.Buffer

	stdOutStr := strings.Builder{}

	mw := io.MultiWriter(os.Stdout, &stdBuffer, &stdOutStr)

	cmd.Stdout = mw
	cmd.Stderr = mw

	go cmd.Run()

	for range time.Tick(time.Second * 5) {
		if strings.Contains(stdBuffer.String(), "Accepting") {
			log.Println("Getting tunnel url")
			cmd := exec.Command("npx", "--yes", "localtunnel", "--port", "3000")

			mw := io.MultiWriter(os.Stdout, &stdBuffer, &stdOutStr)

			cmd.Stdout = mw
			cmd.Stderr = mw

			go cmd.Run()
			break
		}
	}

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
	resources, err := s.Monitor.GetSystemResources()
	if err != nil {
		http.Error(w, "Failed to System stats", http.StatusInternalServerError)
		return
	}

	processes, err := s.Monitor.GetSystemProcesses()
	if err != nil {
		http.Error(w, "Failed to System stats", http.StatusInternalServerError)
		return
	}

	fileSystems, err := s.Monitor.GetFileSystems()
	if err != nil {
		http.Error(w, "Failed to System stats", http.StatusInternalServerError)
		return
	}

	json, err := json.Marshal(map[string]interface{}{
		"resources":   resources,
		"processes":   processes,
		"filesystems": fileSystems,
	})
	if err != nil {
		http.Error(w, "Failed to System stats", http.StatusInternalServerError)
		return
	}

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
