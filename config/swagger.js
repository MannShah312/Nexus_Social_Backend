const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// ✅ Swagger configuration options
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Basic Genuin Platform API",
      version: "1.0.0",
      description: "📚 API documentation for the Genuin platform: Brands, Communities, Groups & Videos",
    },
    servers: [{ url: "http://localhost:4000" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      security: [{ bearerAuth: [] }],
    },
  },
  apis: ["./routes/*.js"], // 🔗 Path to route files for Swagger annotations
};

// 📝 Generate Swagger docs
const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = { swaggerUi, swaggerDocs };
