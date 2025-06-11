import type { Request, Response } from "express";
import { config } from "../config.js";

export async function handlerMetrics(_: Request, res: Response) {
  res.send(`Hits: ${config.fileserverHits}`);
  res.end();
}