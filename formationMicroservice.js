const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const Formation = require('./formationModel'); 



// Charger le fichier formationproto
const formationProtoPath = 'formation.proto';
const formationProtoDefinition = protoLoader.loadSync(formationProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const formationProto = grpc.loadPackageDefinition(formationProtoDefinition).formation;

// Connexion à la base de données MongoDB
mongoose.connect('mongodb://localhost:27017/Micro', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
  });
  

// Implémenter le service de livres
const formationService = {
  getFormation: async (call, callback) => {
    try {
      const formationId = call.request.id;
      const formation = await Formation.findById(formationId).exec();
     // console.log(call.request);
      if (!formation) {
        callback({ code: grpc.status.NOT_FOUND, message: 'Formation not found' });
        return;
      }
      callback(null, { formation });
    } catch (error) {
      console.error('Error getting formation:', error);
      callback({ code: grpc.status.INTERNAL, message: 'Internal server error' });
    }
  },
  searchFormations: async (call, callback) => {
    try {
      const formations = await Formation.find({}).exec();
      callback(null, { formations });
    } catch (error) {
      console.error('Error searching formations:', error);
      callback({ code: grpc.status.INTERNAL, message: 'Internal server error' });
    }
  },
  createFormation: async (call, callback) => {
    try {
      const {nom, description, duree, prix} = call.request;
      const newFormation = new Formation({nom, description, duree, prix});
      const savedFormation = await newFormation.save();
      console.log('Formation created successfully:' );
      callback(null, { message: 'Formation created successfully', savedFormation });
    } catch (error) {
      console.error('Error creating Formation:', error);
      callback({ code: grpc.status.INTERNAL, message: 'Internal server error' });
    }
  },
};

// Créer et démarrer le serveur gRPC
const server = new grpc.Server();
server.addService(formationProto.FormationService.service, formationService);
const port = 50051;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('Failed to bind server:', err);
    return;
  }
  console.log(`Server is running on port ${port}`);
  server.start();
});
