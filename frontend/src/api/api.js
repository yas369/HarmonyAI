const SETTINGS_STORAGE_KEY = "harmonyai-settings";

function buildUrl(base, path) {
  const sanitizedBase = base ? base.replace(/\/+$/, "") : "";
  const sanitizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${sanitizedBase}${sanitizedPath}` || sanitizedPath;
}

function isBrowser() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function isLocalHostname(hostname) {
  return /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/i.test(hostname);
}

function isLocalUrl(candidate) {
  if (!candidate) {
    return false;
  }
  try {
    const url = new URL(candidate, isBrowser() ? window.location.origin : "http://localhost");
    return isLocalHostname(url.hostname);
  } catch (_error) {
    return false;
  }
}

let runtimeConfigPromise;

async function loadRuntimeConfig() {
  if (!runtimeConfigPromise) {
    if (typeof fetch !== "function") {
      runtimeConfigPromise = Promise.resolve({});
    } else {
      runtimeConfigPromise = fetch("/app-config.json", { cache: "no-store" })
        .then((response) => (response.ok ? response.json() : {}))
        .catch(() => ({}));
    }
  }
  return runtimeConfigPromise;
}

function getStoredBaseUrl() {
  if (!isBrowser()) {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    const stored = parsed?.apiBaseUrl;
    return typeof stored === "string" && stored.trim().length > 0 ? stored.trim() : null;
  } catch (error) {
    console.warn("Failed to read stored API base", error);
    return null;
  }
}

function normalizeCandidate(value) {
  if (value === undefined || value === null) {
    return null;
  }
  if (value === "") {
    return "";
  }
  const trimmed = String(value).trim();
  return trimmed ? trimmed.replace(/\/+$/, "") : null;
}

async function getApiBaseCandidates(preferredBaseUrl) {
  const candidates = [];

  const addCandidate = (value, { allowRemoteLocalhost = true } = {}) => {
    const normalized = normalizeCandidate(value);
    if (normalized === null || candidates.includes(normalized)) {
      return;
    }

    if (!allowRemoteLocalhost && isBrowser()) {
      const { hostname } = window.location;
      if (!isLocalHostname(hostname) && isLocalUrl(normalized)) {
        return;
      }
    }

    candidates.push(normalized);
  };

  addCandidate(preferredBaseUrl);

  const runtimeConfig = await loadRuntimeConfig();
  if (runtimeConfig?.apiBaseUrl) {
    addCandidate(runtimeConfig.apiBaseUrl, { allowRemoteLocalhost: false });
  }

  addCandidate(getStoredBaseUrl());

  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim().length > 0) {
    addCandidate(envUrl);
  }

  if (isBrowser() && window.location) {
    const { origin, hostname, protocol } = window.location;
    addCandidate(origin);
    addCandidate(`${origin}/api`);
    addCandidate("", { allowRemoteLocalhost: false });

    if (isLocalHostname(hostname)) {
      addCandidate(`${protocol}//localhost:4000`);
      addCandidate(`${protocol}//127.0.0.1:4000`);
    }
  } else {
    addCandidate("");
  }

  addCandidate("http://localhost:4000");

  return candidates;
}

export async function composeTrack(payload, options = {}) {
  const attemptedUrls = [];
  let lastError;

  const baseCandidates = await getApiBaseCandidates(options.preferredBaseUrl);

  for (const baseUrl of baseCandidates) {
    const endpoint = buildUrl(baseUrl ?? "", "generate");
    attemptedUrls.push(endpoint);
    try {
      const response = await fetch(endpoint, {
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

  const fallbackMessage =
    lastError?.message || "Unable to contact the HarmonyAI composer service.";

  throw new Error(
    `${fallbackMessage} (Attempted: ${attemptedUrls.join(", ")})\n` +
      "Update your Composer API URL in Settings or ensure the backend is running."
  );
}
