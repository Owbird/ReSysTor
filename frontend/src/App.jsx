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
const bytesToMB = (bytes) => (bytes / 1024 / 1024).toFixed(2);

function App() {
  const [processes, setProcesses] = useState([]);
  const [fileSystems, setFileSystems] = useState([]);
  const [resources, setResources] = useState({});
  const [hostname, setHostname] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "cpu_usage",
    direction: "desc",
  });
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleSort = (key) => {
    setSortConfig((prevConfig) => {
      const isAsc = prevConfig.key === key && prevConfig.direction === "asc";
      return { key, direction: isAsc ? "desc" : "asc" };
    });
  };

  const filteredProcesses = processes.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.pid.toString().includes(searchQuery) ||
      (p.username &&
        p.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sortedProcesses = [...filteredProcesses].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const getClassNameForHeader = (key) => {
    if (sortConfig.key !== key) {
      return "";
    }
    return sortConfig.direction === "asc" ? "sort-asc" : "sort-desc";
  };

  const { cpu_stats, memory_stats, battery_stats, uptime, local_ip } =
    resources;

  const rootFileSystem = fileSystems.find((fs) => fs.path === "/");

  const topMemoryProcesses = [...processes]
    .sort((a, b) => b.memory_usage - a.memory_usage)
    .slice(0, 5);

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

        <Card title="Top 5 Memory Processes">
          {topMemoryProcesses.map((p) => (
            <div key={p.pid} className="info-item">
              <span>
                {p.pid} - {p.name}
              </span>
              <span>{bytesToMB(p.memory_usage)} MB</span>
            </div>
          ))}
        </Card>
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
        <input
          type="text"
          placeholder="Search processes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <div className="table-container processes-table">
          <table>
            <thead>
              <tr>
                <th
                  onClick={() => handleSort("pid")}
                  className={getClassNameForHeader("pid")}
                >
                  PID
                </th>
                <th
                  onClick={() => handleSort("name")}
                  className={getClassNameForHeader("name")}
                >
                  Name
                </th>
                <th
                  onClick={() => handleSort("username")}
                  className={getClassNameForHeader("username")}
                >
                  User
                </th>
                <th
                  onClick={() => handleSort("cpu_usage")}
                  className={getClassNameForHeader("cpu_usage")}
                >
                  CPU %
                </th>
                <th
                  onClick={() => handleSort("memory_usage")}
                  className={getClassNameForHeader("memory_usage")}
                >
                  Mem %
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedProcesses.map((p) => (
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
