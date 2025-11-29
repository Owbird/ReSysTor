import { useState, useEffect } from "react";
import {
  GetSystemProcesses,
  GetFileSystems,
  GetSystemResources,
  GetHostname,
} from "./actions/Monitor";
import "./App.css";
import { Helmet } from "react-helmet";

const ProgressBar = ({ value = 0, label }) => {
  const displayValue = value ? value.toFixed(1) : "0.0";
  return (
    <div className="progress-bar-container">
      <div className="progress-bar" style={{ width: `${displayValue}%` }}>
        {label || `${displayValue}%`}
      </div>
    </div>
  );
};

const Card = ({ title, children }) => (
  <div className="card">
    <h3 className="card-title">{title}</h3>
    <div className="card-content">{children}</div>
  </div>
);

const bytesToGB = (bytes) => (bytes / 1024 / 1024 / 1024).toFixed(2);

function App() {
  const [processes, setProcesses] = useState([]);
  const [fileSystems, setFileSystems] = useState([]);
  const [resources, setResources] = useState({});
  const [hostname, setHostname] = useState("");

  const fetchData = async () => {
    try {
      const [processesData, resourcesData, fileSystemsData, hostnameData] =
        await Promise.all([
          GetSystemProcesses(),
          GetSystemResources(),
          GetFileSystems(),
          GetHostname(),
        ]);
      setProcesses((processesData && processesData[0]) || []);
      setResources((resourcesData && resourcesData[0]) || {});
      setFileSystems((fileSystemsData && fileSystemsData[0]) || []);
      setHostname((hostnameData && hostnameData[0]) || "");
    } catch (error) {
      console.error("Failed to fetch system data:", error);
    }
  };

  useEffect(() => {
    fetchData(); // Fetch immediately on mount
    const interval = setInterval(fetchData, 2000); // Then fetch every 2 seconds
    return () => clearInterval(interval);
  }, []);

  const { cpu_stats, memory_stats, battery_stats, uptime, local_ip } =
    resources;

  const rootFileSystem = fileSystems.find((fs) => fs.path === "/");

  const title = `${hostname || "ReSysTor"} System Monitor`;

  return (
    <div className="container">
      <Helmet>
        <title>ReSysTor - {title}</title>
      </Helmet>

      <h1>{title}</h1>

      <div className="grid">
        <Card title="System Information">
          <div className="info-item">
            <span className="text-muted">Uptime</span>
            <span>
              {uptime
                ? `${uptime.days}d ${uptime.hours}h ${uptime.minutes}m`
                : "N/A"}
            </span>
          </div>
          <div className="info-item">
            <span className="text-muted">IP Address</span>
            <span>{local_ip || "N/A"}</span>
          </div>
          <div className="info-item">
            <span className="text-muted">Battery</span>
            <span>
              {battery_stats
                ? `${battery_stats.current_power}% [${battery_stats.charging_state}]`
                : "N/A"}
            </span>
          </div>
        </Card>

        <Card title={`CPU: ${cpu_stats?.model || "N/A"}`}>
          <div className="cpu-cores">
            {cpu_stats?.usages?.map((usage, index) => (
              <div key={index}>
                <span className="text-muted">Core {index + 1}</span>
                <ProgressBar value={usage} />
              </div>
            ))}
          </div>
        </Card>

        <Card title="Memory">
          <ProgressBar value={memory_stats?.used_percentage} />
          <div className="info-item text-muted">
            <span>Used</span>
            <span>
              {memory_stats ? `${bytesToGB(memory_stats.used)} GB` : "N/A"}
            </span>
          </div>
          <div className="info-item text-muted">
            <span>Total</span>
            <span>
              {memory_stats ? `${bytesToGB(memory_stats.total)} GB` : "N/A"}
            </span>
          </div>
        </Card>

        {rootFileSystem && (
          <Card title="Disk Usage (/)">
            <ProgressBar value={rootFileSystem.used_percentage} />
            <div className="info-item text-muted">
              <span>Used</span>
              <span>{`${bytesToGB(rootFileSystem.used)} GB`}</span>
            </div>
            <div className="info-item text-muted">
              <span>Total</span>
              <span>{`${bytesToGB(rootFileSystem.total)} GB`}</span>
            </div>
          </Card>
        )}
      </div>

      <div>
        <h2>Disks</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Device</th>
                <th>Type</th>
                <th>Total</th>
                <th>Used</th>
                <th>Usage</th>
              </tr>
            </thead>
            <tbody>
              {fileSystems.map((fs, idx) => (
                <tr key={idx}>
                  <td>{fs.device}</td>
                  <td>{fs.disk_type}</td>
                  <td>{bytesToGB(fs.total)} GB</td>
                  <td>{bytesToGB(fs.used)} GB</td>
                  <td>
                    <ProgressBar value={fs.used_percentage} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2>Processes</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>PID</th>
                <th>Name</th>
                <th>User</th>
                <th>CPU %</th>
                <th>Mem %</th>
              </tr>
            </thead>
            <tbody>
              {processes
                .sort((a, b) => b.cpu_usage - a.cpu_usage)
                .slice(0, 15)
                .map((p) => (
                  <tr key={p.pid}>
                    <td>{p.pid}</td>
                    <td>{p.name}</td>
                    <td>{p.username || "N/A"}</td>
                    <td>{p.cpu_usage.toFixed(2)}%</td>
                    <td>{p.memory_usage.toFixed(2)}%</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
