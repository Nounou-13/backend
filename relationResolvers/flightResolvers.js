// flightResolvers.js
const flightResolvers = {
    origin: async (parent, args, context) => {
      try {
        const result = await context.session.run(`
          MATCH (f:Flight {id: $flightId})-[:ORIGIN]->(o:Airport)
          RETURN o
        `, { flightId: parent.id });
  
        return result.records[0].get('o').properties;
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'aéroport d\'origine:', error);
        throw new Error('Erreur lors de la récupération de l\'aéroport d\'origine');
      }
    },
  
    destination: async (parent, args, context) => {
      try {
        const result = await context.session.run(`
          MATCH (f:Flight {id: $flightId})-[:DESTINATION]->(d:Airport)
          RETURN d
        `, { flightId: parent.id });
  
        return result.records[0].get('d').properties;
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'aéroport de destination:', error);
        throw new Error('Erreur lors de la récupération de l\'aéroport de destination');
      }
    },
  
    tickets: async (parent, args, context) => {
      try {
        const result = await context.session.run(`
          MATCH (f:Flight {id: $flightId})-[:ASSIGN]->(t:Ticket)
          RETURN t
        `, { flightId: parent.id });
  
        return result.records.map(record => record.get('t').properties);
      } catch (error) {
        console.error('Erreur lors de la récupération des billets associés au vol:', error);
        throw new Error('Erreur lors de la récupération des billets associés au vol');
      }
    },
  };
  
  module.exports = flightResolvers;
  