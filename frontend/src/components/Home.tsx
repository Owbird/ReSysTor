"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  return `${size} ${sizes[i]}`;
};

interface Props {
  config: ServerConfig;
}

export default function Home({ config }: Props) {
  const { name, interval } = config;

  const [monitorData, setMontitorData] = useState<MonitorData | null>();
  const [searchQuery, setSearchQuery] = useState("");

  const getGaugeColor = (value: number) => {
    if (value < 50) {
      return "green";
    } else if (value >= 50 && value <= 70) {
      return "yellow";
    } else {
      return "red";
    }
  };

  const getData = async () => {
    const res = await fetch(`http://localhost:8080`);

    const data = await res.json();

    setMontitorData(data);
  };

  useEffect(() => {
    getData();

    const ms = parseInt(interval) * 1000;

    const intervalFn = setInterval(() => getData(), ms);

    return () => clearInterval(intervalFn);
  }, []);

  const filteredProcesses = useMemo(() => {
    const processes = monitorData?.processes ?? [];

    if (!searchQuery) {
      return processes;
    }

    return processes.filter(
      (process) =>
        process.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        process.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        process.pid.toString().includes(searchQuery),
    );
  }, [monitorData, searchQuery]);

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;

    setSearchQuery(query);
  };

  if (!monitorData) return <div></div>;

  const { resources, filesystems } = monitorData;

  return (
    <main>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">
          {name}&apos;s Remote System Monitor
        </h1>
        <div className="mt-4 mb-2">
          <div className="border rounded-lg p-4 bg-white shadow-md">
            <h3 className="font-bold">Resources</h3>
            <p>Local IP: {resources.local_ip}</p>
            <div>
              <h4 className="font-bold">Uptime</h4>
              <p>
                {resources.uptime.days}d {resources.uptime.hours}h{" "}
                {resources.uptime.minutes}m
              </p>
            </div>
            <div>
              <h4 className="font-bold">Battery</h4>
              <p>State: {resources.battery_stats.charging_state}</p>
              <p>Power: {resources.battery_stats.current_power}%</p>
            </div>
            <div>
              <h4 className="font-bold">Memory</h4>
              <p>Total: {formatBytes(resources.memory_stats.total)}</p>
              <p>
                Used: {formatBytes(resources.memory_stats.used)} (
                {resources.memory_stats.used_percentage.toFixed(2)}%)
              </p>
              <p>Free: {formatBytes(resources.memory_stats.free)}</p>
            </div>
            <div>
              <h4 className="font-bold">CPU</h4>
              <p>Model: {resources.cpu_stats.model}</p>
              <p>Cores: {resources.cpu_stats.cores}</p>
              <div className="grid grid-cols-4">
                {resources.cpu_stats.usages.map((cpu, index) => (
                  <div
                    key={index}
                    className="flex flex-col justify-center items-center"
                  >
                    <p>CPU {index + 1}</p>
                    <Gauge
                      width={100}
                      height={100}
                      value={cpu}
                      text={`${cpu.toFixed(0)}%`}
                      valueMin={0}
                      valueMax={100}
                      sx={{
                        [`& .${gaugeClasses.valueArc}`]: {
                          fill: getGaugeColor(cpu),
                        },
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mt-2 mb-2">File systems</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filesystems.map((filesystem) => (
              <div
                key={filesystem.device}
                className="border rounded-lg p-4 bg-white shadow-md"
              >
                <h3 className="font-bold">{filesystem.device}</h3>
                <p>Disk Type: {filesystem.disk_type}</p>
                <p>Path: {filesystem.path}</p>
                <p>Total: {formatBytes(filesystem.total)}</p>
                <p>Free: {formatBytes(filesystem.free)}</p>
                <p>
                  Used: {formatBytes(filesystem.used)} (
                  {filesystem.used_percentage.toFixed(2)}%)
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-xl font-bold mb-2">Processes</h3>
          <input
            onChange={handleSearch}
            placeholder="Search PID, Name, Username"
            className="border rounded-lg p-2 mb-2"
          />
          <div className="max-h-screen overflow-scroll grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProcesses.map((process) => (
              <div
                key={process.pid}
                className="border rounded-lg p-4 bg-white shadow-md"
              >
                <h3 className="font-bold">{process.name}</h3>
                <p>Username: {process.username}</p>
                <p>PID: {process.pid}</p>
                <p>Memory Usage: {formatBytes(process.memory_usage)}</p>
                <p>CPU Usage: {process.cpu_usage.toFixed(2)}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
