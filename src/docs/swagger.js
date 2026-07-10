import swaggerJsdoc from "swagger-jsdoc";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;
const HOSTED_URL = process.env.HOSTED_URL;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Z-Scout API",
      version: "1.0.0",
      description:
        "Official API documentation for the Z-Scout Football Scouting Platform.",
    },

    servers: [
      {
        url: `http://localhost:${PORT}/api/v1`,
        description: "Local Development",
      },
      {
        url: `${HOSTED_URL}/api/v1`,
        description: "Production Server",
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

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);
console.log("Swagger Paths:", swaggerSpec.paths);

export default swaggerSpec;
