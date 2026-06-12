import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { env } from "./config/env";
import { createApiRouter, setSocketIoInstance } from "./routes";
import { registerSocketHandlers } from "./socket";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: env.frontendOrigin
  }
});

setSocketIoInstance(io);

app.use(cors({ origin: env.frontendOrigin }));
app.use(express.json());
app.use("/api", createApiRouter());

registerSocketHandlers(io);

server.listen(env.port, () => {
  console.log(`RailMind backend listening on http://localhost:${env.port}`);
});
