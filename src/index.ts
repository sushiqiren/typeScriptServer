// import express from 'express';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const app = express();
// const PORT = 8080;

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// app.use(express.static(path.join(__dirname, "../")));

// app.listen(PORT, () => {
//     console.log(`Server is running at http://localhost:${PORT}`);
// });

import express from "express";

const app = express();
const PORT = 8080;

app.use("/app", express.static("./src/app"));

function handlerReadiness(req: express.Request, res: express.Response) {
  res.set("Content-Type", "text/plain");
  res.send("OK");
}

app.get("/healthz", handlerReadiness);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
