const serverless = require('@netlify/functions');
const app = require('../../server').default;

exports.handler = serverless(app);
