// ticketResolvers.js
const ticketResolvers = {
    flight: async (parent, args, context) => {
      try {
        const result = await context.session.run(`
          MATCH (t:Ticket {id: $ticketId})-[:ASSIGN]->(f:Flight)
          RETURN f
        `, { ticketId: parent.id });
  
        return result.records[0].get('f').properties;
      } catch (error) {
        console.error('Erreur lors de la récupération du vol associé au billet:', error);
        throw new Error('Erreur lors de la récupération du vol associé au billet');
      }
    },
  };
  
  module.exports = ticketResolvers;
  