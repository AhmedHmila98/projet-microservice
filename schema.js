
// Définir le schéma GraphQL
const typeDefs = `#graphql
  type Etudiant {
    id: String!
    nom: String!
    prenom: String!
    login: String!
    password: String!
    cin: String!
    
  }

  type Formation {
    id: String!
    nom: String!
    description: String!
    prix: String!
    duree: String!
    
  }

  type Query {
    etudiant(id: String!): Etudiant
    etudiants: [Etudiant]
    addEtudiant(nom:String!, prenom: String!, login: String!, password:String!,cin: String!): String!

    formation(id: String!): Formation
    formations: [Formation]
    addFormation(nom:String!, description: String!, duree: String!, prix:String!): String!
    
  }
  
`;


module.exports = typeDefs;
