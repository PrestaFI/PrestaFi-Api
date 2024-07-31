const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  // Use 'definition' instead of 'swaggerDefinition'
  definition: {
    openapi: '3.0.0', // Specify the OpenAPI version
    info: {
      title: 'Your API Title',
      version: '1.0.0',
      description: 'Description of your API',
    },
    // If you want to add authentication with Swagger UI
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    },
  },
  apis: ['./routes/*.js'], // Path to the API routes files
};

const openapiSpecification = swaggerJsdoc(options);

module.exports = openapiSpecification;
