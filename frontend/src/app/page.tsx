import Home from "@/components/Home";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const res = await fetch(`http://localhost:8080/config`, {
    cache: "no-cache",
  });

  const config = await res.json();

  return <Home name={config.name} interval={config.interval} />;
}
