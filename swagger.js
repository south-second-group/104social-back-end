const swaggerAutogen = require('swagger-autogen')();
// const User = require('./models/usersModel');

const doc = {
  info: {
    title: '104social',
    description: 'A social networking website for connecting people.',
  },
  host: 'localhost:3000',
  schemes: ['http', 'https'],
  securityDefinitions: {
    Bearer: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description:
        'Enter "Bearer+space+{token}"。Example: "Bearer eyXXX.XXX.XXX"',
    },
  },
  security: [
    {
      Bearer: [],
    },
  ],
  definitions: {
    User: {
      type: 'object',
      properties: {},
    },
  },
};

// User schema fields
// Object.keys(User.schema.paths).forEach((field) => {
//   const type = User.schema.paths[field].instance.toLowerCase();
//   doc.definitions.User.properties[field] = { type };
// });

const outputFile = './swagger-output.json'; 
const endpointsFiles = ['./app.js']; 

swaggerAutogen(outputFile, endpointsFiles, doc);