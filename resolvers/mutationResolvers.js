// mutationResolvers.js
const mutationResolvers = {
    // Résolveur pour l'ajout d'un aéroport
    addAirport: async (_, { name }, context) => {
      try {
        const result = await context.session.run('CREATE (a:Airport { name: $name }) RETURN a', { name });
        return result.records[0].get('a').properties;
      } catch (error) {
        console.error('Erreur lors de l\'ajout d\'un aéroport:', error);
        throw new Error('Erreur lors de l\'ajout d\'un aéroport');
      }
    },
    // Résolveur pour l'ajout d'un vol
    addFlight: async (_, { date, duration, distance, airline, origin, destination }, context) => {
        try {
          const result = await context.session.run(`
            MATCH (o:Airport { name: $origin })
            MATCH (d:Airport { name: $destination })
            CREATE (f:Flight { 
              date: $date,
              duration: $duration,
              distance: $distance,
              airline: $airline
            })
            MERGE (f)-[:ORIGIN]->(o)
            MERGE (f)-[:DESTINATION]->(d)
            RETURN f, o, d
          `, { date, duration, distance, airline, origin, destination });
    
          const record = result.records[0];
    
          return {
            ...record.get('f').properties,
            origin: record.get('o').properties,
            destination: record.get('d').properties,
          };
        } catch (error) {
          console.error('Erreur lors de l\'ajout d\'un vol:', error);
          throw new Error('Erreur lors de l\'ajout d\'un vol');
        }
      },
      // Résolveur pour l'ajout d'un billet
      addTicket: async (_, { ticketClass, price, flight }, context) => {
        try {
          const result = await context.session.run(`
            MATCH (f:Flight { date: $flight })
            CREATE (t:Ticket { \`class\`: $ticketClass, price: $price })
            MERGE (t)-[:ASSIGN]->(f)
            RETURN t
          `, { ticketClass, price, flight });
    
          return result.records[0].get('t').properties;
        } catch (error) {
          console.error('Erreur lors de l\'ajout d\'un billet:', error);
          throw new Error('Erreur lors de l\'ajout d\'un billet');
        }
      },
  };
  
  module.exports = mutationResolvers;
  