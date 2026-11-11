require("dotenv").config();
const connectDB = require("./config/database.js");
const express = require("express");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const app = express();
const adminRoutes = require("./routes/adminRoute.js");
const contactRoutes = require("./routes/contactRoutes.js");
const staffRoutes = require("./routes/staffRoute.js");
const videoRoutes = require("./routes/videoRoute.js");

app.use(express.json());

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "NicoFarms Backend API",
      version: "1.0.0",
    },
    servers: [
      {
        url: `https://nicofarms-backend.onrender.com/api`,
        description: "Live server",
      },
      {
        url: `http://localhost:${process.env.PORT || 2043}`,
        description: "Local server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./routes/*.js"],
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/admin", adminRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/videos", videoRoutes);

const PORT = process.env.PORT || 2043;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
