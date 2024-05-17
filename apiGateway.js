const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const bodyParser = require('body-parser');
const cors = require('cors');
const resolvers = require('./resolvers');
const typeDefs = require('./schema');

// Charger le fichier etudiant.proto
const etudiantProtoPath = 'etudiant.proto';
const etudiantProtoDefinition = protoLoader.loadSync(etudiantProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const etudiantProto = grpc.loadPackageDefinition(etudiantProtoDefinition).etudiant;

// Charger le fichier formation.proto
const formationProtoPath = 'formation.proto';
const formationProtoDefinition = protoLoader.loadSync(formationProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const formationProto = grpc.loadPackageDefinition(formationProtoDefinition).formation;



// Créer une nouvelle application Express
const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// Créer une instance ApolloServer avec le schéma et les résolveurs importés
const server = new ApolloServer({ typeDefs, resolvers });

// Démarrer le serveur Apollo avant d'appliquer le middleware
server.start().then(() => {
  app.use(
      cors(),
      bodyParser.json(),
      expressMiddleware(server),
  );

 });
  

    // Définir les routes pour les requêtes REST
    const client = new etudiantProto.EtudiantService('localhost:50052', grpc.credentials.createInsecure());
    const client1 = new formationProto.FormationService('localhost:50051', grpc.credentials.createInsecure());


    // Route pour récupérer tous les livres
    app.get('/etudiants', (req, res) => {
      client.searchEtudiants({}, (err, response) => {
        if (err) {
          console.error('Erreur lors de la recherche de livres :', err);
          res.status(500).send('Erreur lors de la recherche de livres');
        } else {
          res.json(response.etudiants);
        }
      });
    });

    // Route pour récupérer un livre par son ID
    app.get('/etudiants/:id', (req, res) => {
      const id = req.params.id;
      client.getEtudiant({ etudiant_id: id }, (err, response) => {
        if (err) {
          console.error('Erreur lors de la récupération du Etudiant :', err);
          res.status(500).send('Erreur lors de la récupération du Etudiant');
        } else {
          res.json(response.etudiant);
        }
      });
    });

   
    app.post('/etudiants', (req, res) => {
      const { nom, prenom, login, password, cin } = req.body;
      // Assurer la consistance du port gRPC
      client.CreateEtudiant({ nom, prenom, login, password, cin }, (err, response) => {
        if (err) {
          console.error('Erreur lors de la création du Létudiant :', err);
          res.status(500).send('Erreur lors de la création de Létudiant');
        } else {
          res.status(201).json({ message: 'Etudiant ajouté avec succès', etudiant: response.etudiant });
        }
      });
    });

    app.post('/formations', (req, res) => {
      const { nom, description, prix, duree } = req.body;
      // Assurer la consistance du port gRPC
      client1.createFormation({ nom, description, prix, duree }, (err, response) => {
        if (err) {
          console.error('Erreur lors de la création du formation :', err);
          res.status(500).send('Erreur lors de la création de formation');
        } else {
          res.status(201).json({ message: 'Formation ajouté avec succès', formation: response.formation });
        }
      });
    });

    app.get('/formations', (req, res) => {
      client1.searchFormations({}, (err, response) => {
        if (err) {
          console.error('Erreur lors de la recherche de livres :', err);
          res.status(500).send('Erreur lors de la recherche de livres');
        } else {
          res.json(response.formations);
        }
      });
    });

    // Route pour récupérer un livre par son ID
    app.get('/formations/:id', (req, res) => {
      const id = req.params.id;
      client1.getFormation({ id }, (err, response) => {
        if (err) {
          console.error('Erreur lors de la récupération du formation :', err);
          res.status(500).send('Erreur lors de la récupération du formation');
        } else {
          res.json(response.formation);
        }
      });
    });

    
   





    // Démarrer l'application Express
    const port = 3000;
    app.listen(port, () => {
      console.log(`API Gateway en cours d'exécution sur le port ${port}`);
    });
  



