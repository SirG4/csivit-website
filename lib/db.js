import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
  throw new Error("Please define MONGO_URI environment variable");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // Optimize connection pooling
      maxPoolSize: 10,                    // Maximum connections in the pool
      minPoolSize: 5,                     // Maintain minimum connections
      socketTimeoutMS: 45000,             // 45 second socket timeout
      connectTimeoutMS: 10000,            // 10 second connection timeout
      serverSelectionTimeoutMS: 5000,     // 5 second server selection timeout
      retryWrites: true,                  // Automatic retries for transient errors
      retryReads: true,
      compressors: ["snappy"],            // Enable compression for faster data transfer
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
