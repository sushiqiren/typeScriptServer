import express from "express";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";


import { config } from "./config.js";
import { handlerReadiness } from "./api/readiness.js";
import { handlerMetrics } from "./api/metrics.js";
import { handlerReset } from "./api/reset.js";
import {
  middlewareLogResponse,
  middlewareMetricsInc,
  errorHandlerMiddleware,
} from "./api/middleware.js";
// import { handlerChirpValidation } from "./api/chripValidation.js";
import { handlerCreateUser } from "./api/createUser.js";
import { handlerCreateChirp } from "./api/createChirp.js";
import { handlerGetChirps } from "./api/getAllChirps.js";
import { handlerGetChirpById } from "./api/getChirp.js";
import { NotFoundError } from "./api/ApiError.js";

const migrationClient = postgres(config.db.url, {max: 1});

(async () => {
  try {
    console.log("Running database migrations...");
    await migrate(drizzle(migrationClient), config.db.migrationConfig);
    console.log("Migrations completed successfully");
    
    // Start the server after migrations are complete
    startServer();
  } catch (error) {
    console.error("Failed to run migrations:", error);
    process.exit(1);
  } finally {
    // Close the migration client
    await migrationClient.end();
  }
})();

function startServer() {
  const app = express();
  const PORT = 8080;

  app.use(middlewareLogResponse);
  app.use("/app", middlewareMetricsInc, express.static("./src/app"));
  app.use(express.json());

  app.get("/api/healthz", handlerReadiness);
  app.get("/admin/metrics", handlerMetrics);
  app.post("/admin/reset", handlerReset);
  // app.post("/api/validate_chirp", (req, res, next) => {
  //   Promise.resolve(handlerChirpValidation(req, res, next)).catch(next);
  // });

  // Add the new chirps endpoint
  app.post("/api/chirps", (req, res, next) => {
    Promise.resolve(handlerCreateChirp(req, res, next)).catch(next);
  });

  app.get("/api/chirps", (req, res, next) => {
    Promise.resolve(handlerGetChirps(req, res, next)).catch(next);
  });

  app.post("/api/users", (req, res, next) => {
    Promise.resolve(handlerCreateUser(req, res, next)).catch(next);
  });

  // Add the new endpoint for getting a chirp by ID
  app.get("/api/chirps/:chirpID", (req, res, next) => {
    Promise.resolve(handlerGetChirpById(req, res, next)).catch(next);
  });

  // 404 handler for undefined routes
  app.use((req, res, next) => {
    next(new NotFoundError(`Route ${req.method} ${req.path} not found`));
  });

  // Error handling middleware
  app.use(errorHandlerMiddleware);

  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

