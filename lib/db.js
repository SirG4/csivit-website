import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
  throw new Error("Please define MONGO_URI environment variable");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const CONNECT_TIMEOUT_MS = 20000;
const CONNECT_RETRY_DELAY_MS = 1000;
const CONNECT_MAX_RETRIES = 2;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const withTimeout = (promise, timeoutMs) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Mongo connection timeout")),
        timeoutMs,
      ),
    ),
  ]);

async function dbConnect() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // Reuse in-flight connection attempt instead of resetting while connecting.
  if (cached.promise && mongoose.connection.readyState === 2) {
    cached.conn = await withTimeout(cached.promise, CONNECT_TIMEOUT_MS);
    return cached.conn;
  }

  if (mongoose.connection.readyState === 0) {
    cached.conn = null;
    cached.promise = null;
  }

  const opts = {
    bufferCommands: false,
    // More resilient defaults for Atlas over variable networks.
    maxPoolSize: 20,
    minPoolSize: 2,
    maxIdleTimeMS: 30000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 15000,
    serverSelectionTimeoutMS: 15000,
    heartbeatFrequencyMS: 10000,
    retryWrites: true,
    retryReads: true,
    family: 4,
  };

  let lastError;
  for (let attempt = 0; attempt <= CONNECT_MAX_RETRIES; attempt += 1) {
    if (!cached.promise) {
      cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
        return mongoose;
      });
    }

    try {
      cached.conn = await withTimeout(cached.promise, CONNECT_TIMEOUT_MS);
      return cached.conn;
    } catch (e) {
      lastError = e;
      cached.promise = null;
      if (attempt < CONNECT_MAX_RETRIES) {
        await sleep(CONNECT_RETRY_DELAY_MS);
      }
    }
  }

  throw lastError;
}

export async function resetDbConnection() {
  cached.conn = null;
  cached.promise = null;

  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  } catch {
    // Best-effort reset: reconnect path will recover on next call.
  }
}

export default dbConnect;
