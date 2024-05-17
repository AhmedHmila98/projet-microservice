// resolvers.js
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Charger le fichier book.proto
const etudiantProtoPath = 'etudiant.proto';
const formationProtoPath = 'formation.proto';

const etudiantProtoDefinition = protoLoader.loadSync(etudiantProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const etudiantProto = grpc.loadPackageDefinition(etudiantProtoDefinition).etudiant;

const formationProtoDefinition = protoLoader.loadSync(formationProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const formationProto = grpc.loadPackageDefinition(formationProtoDefinition).formation;

// Définir les résolveurs pour les requêtes GraphQL
const resolvers = {
  Query: {
    formation: (_, { id }) => {
     
      const client1 = new formationProto.FormationService('localhost:50051', grpc.credentials.createInsecure());
      return new Promise((resolve, reject) => {
        client1.getFormation({ id }, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.formation);
          }
        });
      });
    },
    formations: () => {
      // Effectuer un appel gRPC au microservice de livres
      const client1 = new formationProto.FormationService('localhost:50051', grpc.credentials.createInsecure());
      return new Promise((resolve, reject) => {
        client1.searchFormations({}, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.formations);
          }
        });
      });
    },

    addFormation: (_, { nom, description, prix, duree}) => {

      const client1 = new formationProto.FormationService('localhost:50051', grpc.credentials.createInsecure());
    
      return new Promise((resolve, reject) => {
          client1.createFormation({  
            nom: nom,
            description: description,
            prix: prix,
            duree: duree
          
          }, (err, response) => {
              if (err) {
                  reject(err);
              } else {
                  resolve(response.message);
              }
          });
      });
    },



    etudiant: (_, { id }) => {
      
      const client = new etudiantProto.EtudiantService('localhost:50052', grpc.credentials.createInsecure());
      return new Promise((resolve, reject) => {
        client.getEtudiant({ etudiant_id: id }, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.etudiant);
          }
        });
      });
    },
    etudiants: () => {
      
      const client = new etudiantProto.EtudiantService('localhost:50052', grpc.credentials.createInsecure());
      return new Promise((resolve, reject) => {
        client.searchEtudiants({}, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.etudiants);
          }
        });
      });
    },
    
  addEtudiant: (_, { nom, prenom, login, password, cin }) => {
    // Effectuer un appel gRPC au microservice de films
    const client = new etudiantProto.EtudiantService('localhost:50052', grpc.credentials.createInsecure());

    return new Promise((resolve, reject) => {
        client.createEtudiant({  
          cin: cin,
          nom: nom,
          prenom: prenom,
          login: login,
          password: password
        
        }, (err, response) => {
            if (err) {
                reject(err);
            } else {
                resolve(response.message);
            }
        });
    });
},







  },
  

};


module.exports = resolvers;
