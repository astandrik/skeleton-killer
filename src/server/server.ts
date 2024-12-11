import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import path from "path";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Serve static files from the dist/client directory with proper MIME types
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  express.static(path.join(__dirname, "../../dist/client"), {
    setHeaders: (res, filepath) => {
      if (filepath.endsWith(".js")) {
        res.set("Content-Type", "application/javascript");
      } else if (filepath.endsWith(".mjs")) {
        res.set("Content-Type", "application/javascript");
      } else if (filepath.endsWith(".ts")) {
        res.set("Content-Type", "application/javascript");
      }
    },
  })
);

// Game state interfaces
interface Player {
  id: string;
  x: number;
  y: number;
  health: number;
}

interface Skeleton {
  id: string;
  x: number;
  y: number;
  health: number;
}

const players = new Map<string, Player>();
const skeletons = new Map<string, Skeleton>();

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  const player: Player = {
    id: socket.id,
    x: Math.random() * 800,
    y: Math.random() * 600,
    health: 100,
  };
  players.set(socket.id, player);
  socket.broadcast.emit("playerJoined", player);
  socket.emit("currentPlayers", Array.from(players.values()));
  socket.emit("currentSkeletons", Array.from(skeletons.values()));

  socket.on("playerMove", (position: { x: number; y: number }) => {
    const player = players.get(socket.id);
    if (player) {
      player.x = position.x;
      player.y = position.y;
      socket.broadcast.emit("playerMoved", {
        id: socket.id,
        x: position.x,
        y: position.y,
      });
    }
  });

  socket.on("playerAttack", (attackData: { x: number; y: number }) => {
    socket.broadcast.emit("playerAttacked", { id: socket.id, ...attackData });
  });

  socket.on("attackSkeleton", ({ id }: { id: string }) => {
    const skeleton = skeletons.get(id);
    if (skeleton) {
      skeleton.health -= 25; // Each hit does 25 damage
      if (skeleton.health <= 0) {
        skeletons.delete(id);
        io.emit("skeletonHit", { id, health: 0 });
      } else {
        io.emit("skeletonHit", { id, health: skeleton.health });
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
    players.delete(socket.id);
    io.emit("playerLeft", socket.id);
  });
});

// Spawn skeletons periodically
setInterval(() => {
  if (skeletons.size < 500) {
    const skeleton: Skeleton = {
      id: `skeleton-${Date.now()}`,
      x: Math.random() * 800,
      y: Math.random() * 600,
      health: 100,
    };
    skeletons.set(skeleton.id, skeleton);
    io.emit("skeletonSpawned", skeleton);
  }
}, 500);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
