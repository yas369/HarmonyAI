function normalizeBase(url) {
  return url.replace(/\/$/, "");
}

function buildUrl(base, path) {
  const sanitizedBase = base.replace(/\/+$/, "");
  const sanitizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${sanitizedBase}${sanitizedPath}`;
}

function getApiBaseCandidates() {
  const candidates = [];

  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim().length > 0) {
    candidates.push(envUrl);
  }

  if (typeof window !== "undefined" && window.location) {
    const { origin, hostname, protocol } = window.location;
    candidates.push(`${normalizeBase(origin)}/api`);

    if (/localhost|127\.0\.0\.1/i.test(hostname)) {
      const localBase = `${protocol}//localhost:4000`;
      const loopbackBase = `${protocol}//127.0.0.1:4000`;
      candidates.push(localBase, loopbackBase);
    }
  }

  candidates.push("http://localhost:4000");

  const normalized = candidates
    .filter(Boolean)
    .map((candidate) => candidate.replace(/\/+$/, ""));

  return Array.from(new Set(normalized));
}

export async function composeTrack(payload) {
  const attemptedBases = getApiBaseCandidates();
  let lastError;

  for (const baseUrl of attemptedBases) {
    try {
      const response = await fetch(buildUrl(baseUrl, "generate"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const message =
          typeof data?.message === "string"
            ? data.message
            : `Request failed with status ${response.status}`;
        const error = new Error(message);
        error.status = response.status;

        if (response.status === 404) {
          lastError = error;
          continue;
        }

        throw error;
      }

      return response.json();
    } catch (error) {
      const status = error?.status;
      if (status && status !== 404) {
        throw error;
      }

      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  const attempted = attemptedBases.join(", ");
  const fallbackMessage =
    lastError?.message || "Unable to contact the HarmonyAI composer service.";

  throw new Error(`${fallbackMessage} (Attempted: ${attempted})`);
}
