const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const Etudiant = require('./etudiantModel'); 



// Charger le fichier book.proto
const etudiantProtoPath = 'etudiant.proto';
const etudiantProtoDefinition = protoLoader.loadSync(etudiantProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const etudiantProto = grpc.loadPackageDefinition(etudiantProtoDefinition).etudiant;

// Connexion à la base de données MongoDB
mongoose.connect('mongodb://localhost:27017/Micro', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
  });
  

// Implémenter le service de livres
const etudiantService = {
  getEtudiant: async (call, callback) => {
    try {
      const etudiantId = call.request.etudiant_id;
      const etudiant = await Etudiant.findById(etudiantId).exec();
      if (!etudiant) {
        callback({ code: grpc.status.NOT_FOUND, message: 'Etudiant not found' });
        return;
      }
      callback(null, { etudiant });
    } catch (error) {
      console.error('Error getting etudiant:', error);
      callback({ code: grpc.status.INTERNAL, message: 'Internal server error' });
    }
  },
  searchEtudiants: async (call, callback) => {
    try {
      const etudiants = await Etudiant.find({}).exec();
      callback(null, { etudiants });
    } catch (error) {
      console.error('Error searching etudiants:', error);
      callback({ code: grpc.status.INTERNAL, message: 'Internal server error' });
    }
  },
  createEtudiant: async (call, callback) => {
    try {
      const { nom, prenom, login, password, cin  } = call.request;
      const newEtudiant = new Etudiant({  nom, prenom, login, password, cin });
      const savedEtudiant = await newEtudiant.save();
      console.log('Etudiant created successfully:' );
      callback(null, { message: 'Etudiant created successfully', savedEtudiant });
    } catch (error) {
      console.error('Error creating Etudiant:', error);
      callback({ code: grpc.status.INTERNAL, message: 'Internal server error' });
    }
  },
};

// Créer et démarrer le serveur gRPC
const server = new grpc.Server();
server.addService(etudiantProto.EtudiantService.service, etudiantService);
const port = 50052;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('Failed to bind server:', err);
    return;
  }
  console.log(`Server is running on port ${port}`);
  server.start();
});
