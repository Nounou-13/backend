// queryResolvers.js
const queryResolvers = {
    nodeCount: async (parent, args, context) => {
      // Résolveur pour le nombre total de nœuds dans Neo4j
      try {
        const result = await context.session.run('MATCH (n) RETURN count(n) as nodeCount');
        return result.records[0].get('nodeCount').toInt();
      } catch (error) {
        console.error('Erreur lors de la requête Neo4j:', error);
        throw new Error('Erreur lors de la requête Neo4j');
      }
    },
  
    allAirports: async (parent, args, context) => {
      // Résolveur pour récupérer tous les aéroports
      try {
        const result = await context.session.run('MATCH (a:Airport) RETURN a');
        return result.records.map(record => record.get('a').properties);
      } catch (error) {
        console.error('Erreur lors de la requête Neo4j:', error);
        throw new Error('Erreur lors de la requête Neo4j');
      }
    },
  
    allFlights: async (parent, args, context) => {
      // Résolveur pour récupérer tous les vols
      try {
        const result = await context.session.run('MATCH (f:Flight)-[:ORIGIN]->(o:Airport)-[:DESTINATION]->(d:Airport) RETURN f, o, d');
        return result.records.map(record => {
          const flight = record.get('f').properties;
          const origin = record.get('o').properties;
          const destination = record.get('d').properties;
  
          return {
            ...flight,
            origin,
            destination,
          };
        });
      } catch (error) {
        console.error('Erreur lors de la requête Neo4j:', error);
        throw new Error('Erreur lors de la requête Neo4j');
      }
    },

    Flight: {
        // Résolveur pour récupérer les détails de l'aéroport d'origine
        origin: async (parent, args, context) => {
          try {
            const result = await context.session.run(`
              MATCH (f:Flight { date: $date })-[:ORIGIN]->(o:Airport)
              RETURN o
            `, { date: parent.date });
    
            return result.records[0].get('o').properties;
          } catch (error) {
            console.error('Erreur lors de la requête Neo4j:', error);
            throw new Error('Erreur lors de la requête Neo4j');
          }
        },
        // Résolveur pour récupérer les détails de l'aéroport de destination
        destination: async (parent, args, context) => {
          try {
            const result = await context.session.run(`
              MATCH (f:Flight { date: $date })-[:DESTINATION]->(d:Airport)
              RETURN d
            `, { date: parent.date });
    
            return result.records[0].get('d').properties;
          } catch (error) {
            console.error('Erreur lors de la requête Neo4j:', error);
            throw new Error('Erreur lors de la requête Neo4j');
          }
        },
        // Résolveur pour récupérer tous les billets associés à un vol
        tickets: async (parent, args, context) => {
          try {
            const result = await context.session.run(`
              MATCH (f:Flight { date: $date })-[:ASSIGN]->(t:Ticket)
              RETURN t
            `, { date: parent.date });
    
            return result.records.map(record => record.get('t').properties);
          } catch (error) {
            console.error('Erreur lors de la requête Neo4j:', error);
            throw new Error('Erreur lors de la requête Neo4j');
          }
        },
      },

  };
  
  module.exports = queryResolvers;
  