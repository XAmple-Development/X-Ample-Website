import "server-only";

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export async function tebexPluginFetch<T>(path: string): Promise<T> {
  const secret = mustEnv("TEBEX_PLUGIN_SECRET");
  const url = `https://plugin.tebex.io${path}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "X-Tebex-Secret": secret,
    },
    cache: "no-store",
  });

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg = typeof data === "object" && data ? JSON.stringify(data) : String(data);
    throw new Error(`Tebex Plugin ${res.status}: ${msg}`);
  }

  return data as T;
}

