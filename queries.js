// queries.js

// Importez les modules nécessaires
const { session } = require('./neo4j');

const allAirports = async (_, args, { session }) => {
  try {
    const result = await session.run('MATCH (a:Airport) RETURN a');
    return result.records.map(record => record.get('a').properties);
  } catch (error) {
    console.error('Erreur lors de la requête Neo4j:', error);
    throw new Error('Erreur lors de la requête Neo4j');
  }
};

const allFlights = async (_, args, { session }) => {
  try {
    const result = await session.run(`
      MATCH (f:Flight)
      OPTIONAL MATCH (f)-[:ORIGIN]->(o:Airport)
      OPTIONAL MATCH (f)-[:DESTINATION]->(d:Airport)
      OPTIONAL MATCH (f)-[:ASSIGN]->(t:Ticket)
      RETURN f, o, d, t
    `);

    return result.records.map(record => {
      const flight = record.get('f').properties;
      const origin = record.get('o') ? record.get('o').properties : null;
      const destination = record.get('d') ? record.get('d').properties : null;
      const tickets = record.get('t') ? [{ ticket: record.get('t').properties }] : [];

      // Assurez-vous que la distance est convertie en entier
      flight.distance = parseInt(flight.distance);
      flight.duration = parseInt(flight.duration);

      return {
        ...flight,
        origin,
        destination,
        tickets,
      };
    });
  } catch (error) {
    console.error('Erreur lors de la requête Neo4j:', error);
    throw new Error('Erreur lors de la requête Neo4j');
  }
};

  const allTickets = async (_, args, { session }) => {
    try {
      // Exécute la requête pour récupérer tous les billets avec leurs vols associés
      const result = await session.run(`
        MATCH (t:Ticket)-[:ASSIGN]->(f:Flight)
        RETURN t, f
      `);
  
      return result.records.map(record => {
        const ticket = record.get('t').properties;
        const flight = record.get('f') ? record.get('f').properties : null; // Vérifiez si le vol existe
  
        return {
          ...ticket,
          flight: flight,
          ticketClass: ticket.class || "",
          // Convertir la propriété price en chaîne de caractères si nécessaire
          price: String(ticket.price),
        };
      });
    } catch (error) {
      console.error('Erreur lors de la requête Neo4j pour tous les billets:', error);
      throw new Error('Erreur lors de la requête Neo4j pour tous les billets');
    }
  };
  
  
  

  const tickets = async (parent, args, { session }) => {
    try {
      // Exécute la requête pour récupérer la relation entre les billets et les vols
      const result = await session.run(`
        MATCH p=()-[:ASSIGN]->() 
        RETURN p
      `);
  
      // Extrait les informations pertinentes du résultat
      return result.records.map(record => {
        const relationship = record.get('p');
        // Extrait les propriétés des nœuds et de la relation selon les besoins
        // Par exemple, en supposant que vous ayez des propriétés sur les nœuds et la relation
        const ticketProperties = relationship.start.properties;
        const flightProperties = relationship.end.properties;
  
        return {
          ticket: ticketProperties,
          flight: flightProperties,
        };
      });
    } catch (error) {
      console.error('Erreur lors de la requête Neo4j pour les billets:', error);
      throw new Error('Erreur lors de la requête Neo4j pour les billets');
    }
  };
  
  
  const flight = async (parent, args, { session }) => {
    try {
      const result = await session.run(`
        MATCH (t:Ticket { \`class\`: $ticketClass, price: $price })-[:ASSIGN]->(f:Flight)
        RETURN f
      `, { ticketClass: parent.ticketClass, price: parent.price });
  
      // Récupérer le premier enregistrement (s'il existe)
      const record = result.records[0];
  
      // Fermer la session après l'exécution de la requête
      session.close();
  
      // Vérifier si un enregistrement a été trouvé
      if (record) {
        return record.get('f').properties;
      } else {
        // Gérer le cas où aucun vol n'est trouvé
        console.error('Aucun vol trouvé pour le billet avec la classe', parent.ticketClass, 'et le prix', parent.price);
        return null; // Ou une valeur par défaut selon votre logique
      }
    } catch (error) {
      console.error('Erreur lors de la requête Neo4j pour le vol:', error);
      throw new Error('Erreur lors de la requête Neo4j pour le vol');
    }
  };
  
  
  

const origin = async (parent, args, { session }) => {
  try {
    const result = await session.run(`
      MATCH (f:Flight { date: $date })-[:ORIGIN]->(o:Airport)
      RETURN o
    `, { date: parent.date });

    return result.records[0].get('o').properties;
  } catch (error) {
    console.error('Erreur lors de la requête Neo4j pour l\'origine du vol:', error);
    throw new Error('Erreur lors de la requête Neo4j pour l\'origine du vol');
  }
};

const destination = async (parent, args, { session }) => {
    try {
      const result = await session.run(`
        MATCH (f:Flight { date: $date })-[:DESTINATION]->(d:Airport)
        RETURN d
      `, { date: parent.date });
  
      const record = result.records[0];
  
      if (!record) {
        throw new Error('Aucun enregistrement trouvé pour l\'aéroport de destination.');
      }
  
      return record.get('d').properties;
    } catch (error) {
      console.error('Erreur lors de la requête Neo4j pour l\'aéroport de destination:', error);
      throw new Error('Erreur lors de la requête Neo4j pour l\'aéroport de destination');
    }
  };
  

module.exports = {
  allAirports,
  allFlights,
  allTickets, 
  tickets,
  flight,
  origin,
  destination,
};
