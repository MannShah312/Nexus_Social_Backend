const Redis = require("ioredis");

const redis = new Redis({
  host: "localhost", // Container name (same as in Docker)
  port: 6379,
});

redis.on("connect", () => console.log("Connected to Redis via Docker"));
redis.on("error", (err) => console.error("Redis Error:", err));

module.exports = redis;