const cors = require("cors");
const express = require("express");

const { config } = require("./config/env");
const { initFirebase } = require("./config/firebase");
const generateRouter = require("./routes/generate");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(generateRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: err?.message || "Internal Server Error" });
});

async function bootstrap() {
  try {
    initFirebase();
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

if (require.main === module) {
  bootstrap();
}

module.exports = app;
module.exports.bootstrap = bootstrap;
