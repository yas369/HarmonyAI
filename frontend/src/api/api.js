function resolveApiBase() {
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim().length > 0) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, "");
  }

  if (typeof window !== "undefined" && window.location) {
    const { origin } = window.location;
    return `${origin.replace(/\/$/, "")}/api`;
  }

  return "http://localhost:4000";
}

export async function composeTrack(payload) {
  try {
    const baseUrl = resolveApiBase();
    const response = await fetch(`${baseUrl}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const message =
        typeof data?.message === "string"
          ? data.message
          : `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    return response.json();
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "An unexpected error occurred while composing music.";
    throw new Error(message);
  }
}
