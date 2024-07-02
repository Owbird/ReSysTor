package data

type UpTime struct {
	Days    int `json:"days"`
	Hours   int `json:"hours"`
	Minutes int `json:"minutes"`
}

type BatteryStats struct {
	ChargingState string `json:"charging_state"`
	CurrentPower  int    `json:"current_power"`
}

type CPUStats struct {
	Model  string    `json:"model"`
	Cores  int       `json:"cores"`
	Usages []float64 `json:"usages"`
}

type DiskStats struct {
	Path           string  `json:"path"`
	DiskType       string  `json:"disk_type"`
	Device         string  `json:"device"`
	Total          uint64  `json:"total"`
	Free           uint64  `json:"free"`
	Used           uint64  `json:"used"`
	UsedPercentage float64 `json:"used_percentage"`
}

type MemoryStats struct {
	Total          uint64  `json:"total"`
	Used           uint64  `json:"used"`
	Free           uint64  `json:"free"`
	UsedPercentage float64 `json:"used_percentage"`
}

type UserMeta struct {
	Name string `json:"name"`
}

type SystemResources struct {
	LocalIP      string       `json:"local_ip"`
	UpTime       UpTime       `json:"uptime"`
	BatteryStats BatteryStats `json:"battery_stats"`
	MemoryStats  MemoryStats  `json:"memory_stats"`
	CPUStats     CPUStats     `json:"cpu_stats"`
	UserMeta     UserMeta     `json:"user_meta"`
}

type Process struct {
	Name        string  `json:"name"`
	Username    string  `json:"username"`
	Pid         int32   `json:"pid"`
	MemoryUsage float64 `json:"memory_usage"`
	CPUUsage    float64 `json:"cpu_usage"`
}
