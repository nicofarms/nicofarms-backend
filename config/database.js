const mongoose = require("mongoose");
const dns = require("dns");

const connectDB = async () => {
  const databaseUri = (
    process.env.DATABASE_URI ||
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    ""
  ).trim();

  if (!databaseUri) {
    throw new Error("Missing DATABASE_URI in environment variables");
  }

  try {
    if (databaseUri.startsWith("mongodb+srv://")) {
      const dnsServers = (process.env.DATABASE_DNS_SERVERS || "8.8.8.8,1.1.1.1")
        .split(",")
        .map((server) => server.trim())
        .filter(Boolean);

      dns.setServers(dnsServers);
    }

    const connection = await mongoose.connect(databaseUri, {
      dbName: process.env.DATABASE_NAME || undefined,
      serverSelectionTimeoutMS: 10000,
    });

    console.log(
      `Database Connected Successfully` || `Database connected: ${connection.connection.host}/${connection.connection.name}`
    );

    return connection;
  } catch (error) {
    console.error("DataBase connection failed:", error.message);
    throw error;
  }
};

module.exports = connectDB;
