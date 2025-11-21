import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer | null = null;

// Configuración antes de todos los tests
beforeAll(async () => {
  try {
    // Crear MongoDB en memoria con configuración para evitar timeouts
    mongoServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'test-kitchen',
        storageEngine: 'wiredTiger', // Usar wiredTiger en lugar de ephemeralForTest
      },
      binary: {
        version: '7.0.0', // Usar una versión específica que funcione bien
      },
    });
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
    });
    console.log('✅ Test DB connected');
  } catch (error) {
    console.error('❌ Error connecting to test DB:', error);
    throw error;
  }
}, 60000); // Aumentar timeout a 60 segundos

// Limpiar después de cada test
afterEach(async () => {
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  } catch (error) {
    console.error('Error cleaning collections:', error);
  }
});

// Cerrar todo al finalizar
afterAll(async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log('✅ Test DB disconnected');
  } catch (error) {
    console.error('Error disconnecting from test DB:', error);
  }
});