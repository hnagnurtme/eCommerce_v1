// Script to generate a new API key for testing
const mongoose = require('mongoose');
const { createApiKey } = require('./src/services/apiKey.service');
const config = require('./src/configs/config.mongodb');

const { database: { host, port, name } } = config;
const connectString = `mongodb://${host}:${port}/${name}`;

console.log('Connecting to MongoDB...');
mongoose.connect(connectString)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      const apiKey = await createApiKey();
      console.log('API Key created successfully:');
      console.log('Key:', apiKey.key);
      console.log('Permissions:', apiKey.permissions);
    } catch (error) {
      console.error('Error creating API key:', error);
    } finally {
      mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });
