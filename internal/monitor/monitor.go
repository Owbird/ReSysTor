package monitor

import (
	"math"
	"strings"

	"github.com/distatus/battery"
	"github.com/owbird/resystor/internal/data"
	"github.com/owbird/resystor/internal/utils"
	"github.com/shirou/gopsutil/cpu"
	"github.com/shirou/gopsutil/disk"
	"github.com/shirou/gopsutil/mem"
	"github.com/shirou/gopsutil/process"
)

type Monitor struct{}

func NewMonitor() *Monitor { return &Monitor{} }

func (m *Monitor) GetSystemResources() (data.SystemResources, error) {
	stats := data.SystemResources{}

	memoryStats, err := mem.VirtualMemory()
	if err != nil {
		return stats, err
	}

	cpuInfo, err := cpu.Info()
	if err != nil {
		return stats, err
	}

	cpuUsages, err := cpu.Percent(0, true)
	if err != nil {
		return stats, err
	}

	upTime, err := utils.GetUptime()

	if err != nil {
		upTime = data.UpTime{}
	} else {
		stats.UpTime = upTime
	}

	stats.MemoryStats.Total = memoryStats.Total
	stats.MemoryStats.Free = memoryStats.Free
	stats.MemoryStats.Used = memoryStats.Used
	stats.MemoryStats.UsedPercentage = memoryStats.UsedPercent

	stats.CPUStats = data.CPUStats{
		Model:  cpuInfo[0].ModelName,
		Cores:  len(cpuInfo),
		Usages: cpuUsages,
	}

	batteries, err := battery.GetAll()
	if err != nil {
		stats.BatteryStats.CurrentPower = 0
		stats.BatteryStats.ChargingState = "Unknown"
	} else if len(batteries) > 0 {
		batteryStats := batteries[0]

		stats.BatteryStats.CurrentPower = int(math.Round(batteryStats.Current / batteryStats.Full * 100))
		stats.BatteryStats.ChargingState = batteryStats.State.String()
	} else {

		stats.BatteryStats.CurrentPower = 100
		stats.BatteryStats.ChargingState = "Full"

	}

	ip, err := utils.GetLocalIp()
	if err != nil {
		return stats, err
	}

	stats.LocalIP = ip

	return stats, nil
}

func (m *Monitor) GetSystemProcesses() ([]data.Process, error) {
	stats := []data.Process{}

	allProcesses, err := process.Processes()
	if err != nil {
		return stats, err
	}

	for _, currentProcess := range allProcesses {
		name, _ := currentProcess.Name()
		cpuUsage, _ := currentProcess.CPUPercent()
		memory_usage, _ := currentProcess.MemoryPercent()
		username, _ := currentProcess.Username()
		pid := currentProcess.Pid

		process := data.Process{
			Name:        name,
			CPUUsage:    cpuUsage,
			MemoryUsage: float64(memory_usage),
			Pid:         pid,
			Username:    username,
		}

		stats = append(stats, process)

	}
	return stats, nil
}

func (m *Monitor) GetFileSystems() ([]data.DiskStats, error) {
	stats := []data.DiskStats{}

	diskPartitions, err := disk.Partitions(false)
	if err != nil {
		return []data.DiskStats{}, err
	}

	for _, diskPartition := range diskPartitions {
		if !strings.Contains(diskPartition.Device, "loop") {
			diskStats, _ := disk.Usage(diskPartition.Mountpoint)

			stats = append(stats, data.DiskStats{
				Path:           "/",
				DiskType:       diskStats.Fstype,
				Device:         diskPartition.Device,
				Total:          diskStats.Total,
				Free:           diskStats.Free,
				Used:           diskStats.Used,
				UsedPercentage: diskStats.UsedPercent,
			})
		}
	}
	return stats, nil
}
