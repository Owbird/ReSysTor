interface MonitorData {
  filesystems: Filesystem[];
  processes: Process[];
  resources: Resources;
}

interface Filesystem {
  path: string;
  disk_type: string;
  device: string;
  total: number;
  free: number;
  used: number;
  used_percentage: number;
}

interface Process {
  name: string;
  username: string;
  pid: number;
  memory_usage: number;
  cpu_usage: number;
}

interface Resources {
  local_ip: string;
  uptime: Uptime;
  battery_stats: BatteryStats;
  memory_stats: MemoryStats;
  cpu_stats: CpuStats;
  user_meta: UserMeta;
}

interface Uptime {
  days: number;
  hours: number;
  minutes: number;
}

interface BatteryStats {
  charging_state: string;
  current_power: number;
}

interface MemoryStats {
  total: number;
  used: number;
  free: number;
  used_percentage: number;
}

interface CpuStats {
  model: string;
  cores: number;
  usages: number[];
}

interface UserMeta {
  name: string;
}
