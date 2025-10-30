export async function composeTrack(payload) {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL ?? "http://localhost:4000"}/generate`, {
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
    const message = error instanceof Error ? error.message : "An unexpected error occurred while composing music.";
    throw new Error(message);
  }
}
