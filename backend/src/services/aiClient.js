const { spawn } = require("child_process");
const path = require("path");

const { config } = require("../config/env");

async function requestComposition(payload) {
  if (!config.aiServiceUrl) {
    return runLocalComposer(payload);
  }

  try {
    const controller = AbortSignal.timeout(60000);
    const response = await fetch(`${config.aiServiceUrl}/compose`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller,
    });

    if (!response.ok) {
      const bodyText = await response.text().catch(() => "");
      throw new Error(`Composer responded with status ${response.status}: ${bodyText}`);
    }

    const data = await response.json();

    if (data?.audio && data?.midi && data?.pdf) {
      return data;
    }

    throw new Error("Composer response missing file locations");
  } catch (error) {
    console.warn(
      "Remote composer unavailable, attempting local fallback:",
      error.message || error
    );
    return runLocalComposer(payload);
  }
}

function runLocalComposer(payload) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve(__dirname, "../../../composer-ai/app/cli.py");
    const pythonPath = process.env.PYTHON_BIN || process.env.PYTHON || "python3";
    const env = {
      ...process.env,
      PYTHONPATH: buildPythonPath(),
    };

    const subprocess = spawn(pythonPath, [scriptPath], {
      env,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    subprocess.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    subprocess.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    subprocess.on("error", (error) => {
      reject(error);
    });

    subprocess.on("close", (code) => {
      if (code !== 0) {
        const message = stderr.trim() || `Composer CLI exited with status ${code}`;
        return reject(new Error(message));
      }
      try {
        const data = JSON.parse(stdout);
        if (!data.audio || !data.midi || !data.pdf) {
          throw new Error("Composer output missing required fields");
        }
        resolve(data);
      } catch (parseError) {
        reject(
          new Error(
            `Failed to parse composer output: ${parseError.message}\nOutput: ${stdout}`
          )
        );
      }
    });

    subprocess.stdin.write(JSON.stringify(payload));
    subprocess.stdin.end();
  });
}

function buildPythonPath() {
  const composerRoot = path.resolve(__dirname, "../../../composer-ai");
  const existing = process.env.PYTHONPATH || "";
  return existing ? `${composerRoot}${path.delimiter}${existing}` : composerRoot;
}

module.exports = { requestComposition };
