"use client";

import Home from "@/components/Home";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [config, setConfig] = useState<ServerConfig | null>();

  useEffect(() => {
    (async () => {
      const res = await fetch(`http://localhost:8080/config`, {
        cache: "no-cache",
      });

      const config = (await res.json()) as ServerConfig;

      setConfig(config);
    })();
  }, []);

  if (!config) return "Loading...";

  return <Home config={config} />;
}
