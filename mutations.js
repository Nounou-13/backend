// mutations.js

const { session } = require('./neo4j');

///////////////////////////////////////////////////////////////////Airport//////////////////////////////////////////////////////////////////////
const addAirport = async (_, { name }, { session }) => {
    try {
      const result = await session.run('CREATE (a:Airport { name: $name }) RETURN a', { name });
      return result.records[0].get('a').properties;
    } catch (error) {
      console.error('Erreur lors de l\'ajout d\'un aéroport:', error);
      throw new Error('Erreur lors de l\'ajout d\'un aéroport');
    }
  };

  const updateAirport = async (_, { oldName, newName }, { session }) => {
    try {
      const result = await session.run(`
        MATCH (a:Airport { name: $oldName })
        SET a.name = $newName
        RETURN a
      `, { oldName, newName });

      const updatedAirport = result.records[0]?.get('a')?.properties;
      if (!updatedAirport) {
        throw new Error('L\'aéroport n\'a pas été trouvé pour la mise à jour.');
      }

      console.log('Aéroport mis à jour avec succès:', updatedAirport);
      return updatedAirport;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'aéroport:', error.message);
      throw new Error('Erreur lors de la mise à jour de l\'aéroport');
    }
   };

   const deleteAirport = async (_, { name }, { session }) => {
    try {
      const result = await session.run(`
        MATCH (a:Airport { name: $name })
        DETACH DELETE a
      `, { name });

      if (result.summary.counters.nodesDeleted === 0) {
        throw new Error('L\'aéroport n\'a pas été trouvé pour la suppression.');
      }

      console.log('Aéroport supprimé avec succès.');
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'aéroport:', error.message);
      throw new Error('Erreur lors de la suppression de l\'aéroport');
    }
   };

  ///////////////////////////////////////////////////////////////////Flight//////////////////////////////////////////////////////////////////////
  const addFlight = async (_, { date, duration, distance, airline, origin, destination }, { session }) => {
    try {
      const result = await session.run(`
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
  
      if (!record) {
        throw new Error('Aucun enregistrement trouvé après l\'ajout du vol.');
      }
  
      return {
        ...record.get('f').properties,
        origin: record.get('o').properties,
        destination: record.get('d').properties,
      };
    } catch (error) {
      console.error('Erreur lors de l\'ajout d\'un vol:', error);
      throw new Error('Erreur lors de l\'ajout d\'un vol');
    }
  };

  const updateFlight = async (_, { date, duration, distance, airline, origin, destination }, { session }) => {
    try {
        const result = await session.run(`
            MATCH (o:Airport { name: $origin })
            MATCH (d:Airport { name: $destination })
            MATCH (f:Flight { date: $date })
            SET f.duration = $duration, f.distance = $distance, f.airline = $airline
            MERGE (f)-[:ORIGIN]->(o)
            MERGE (f)-[:DESTINATION]->(d)
            RETURN f, o, d
        `, { date, duration, distance, airline, origin, destination });

        const record = result.records[0];

        if (!record) {
            throw new Error('Aucun enregistrement trouvé après la mise à jour du vol.');
        }

        console.log('Vol mis à jour avec succès !'); // Message de succès dans la console

        return {
            ...record.get('f').properties,
            origin: record.get('o').properties,
            destination: record.get('d').properties,
        };
    } catch (error) {
        console.error('Erreur lors de la mise à jour d\'un vol:', error);
        throw new Error('Erreur lors de la mise à jour d\'un vol');
    }
};

   const deleteFlight = async (_, { date }, { session }) => {
    try {
      const result = await session.run(`
        MATCH (f:Flight { date: $date })
        DETACH DELETE f
        RETURN COUNT(f) as count
      `, { date });

      const count = result.records[0].get('count').toInt();

      if (count === 0) {
        throw new Error('Aucun vol trouvé avec la date spécifiée pour la suppression.');
      }

      return {
        success: true,
        message: 'Vol supprimé avec succès.',
      };
    } catch (error) {
      console.error('Erreur lors de la suppression d\'un vol:', error);
      throw new Error('Erreur lors de la suppression d\'un vol');
    }
   };
 
 ///////////////////////////////////////////////////////////////////Ticket//////////////////////////////////////////////////////////////////////
  const addTicket = async (_, { ticketClass, price, flightDate }, { session }) => {
    try {
      const result = await session.run(`
        OPTIONAL MATCH (f:Flight { date: $flightDate })
        CREATE (t:Ticket { \`class\`: $ticketClass, price: $price })
        WITH t, f
        WHERE f IS NOT NULL
        MERGE (t)-[:ASSIGN]->(f)
        RETURN t
      `, { ticketClass, price, flightDate });
  
      const createdTicket = result.records[0]?.get('t')?.properties;
      if (!createdTicket) {
        throw new Error('Le billet n\'a pas été correctement créé.');
      }

      console.log('Billet ajouté avec succès:', createdTicket);
      return createdTicket;
    } catch (error) {
      console.error('Erreur lors de l\'ajout d\'un billet:', error.message);
      throw new Error('Erreur lors de l\'ajout d\'un billet');
    }
};

const updateTicket = async (_, { ticketClass, ticketPrice, newTicketClass, newPrice }, { session }) => {
    try {
      const result = await session.run(`
        MATCH (t:Ticket)-[:ASSIGN]->(f:Flight)
        WHERE t.class = $ticketClass AND t.price = $ticketPrice
        SET t.class = COALESCE($newTicketClass, t.class), t.price = COALESCE($newPrice, t.price)
        RETURN t
      `, { ticketClass, ticketPrice, newTicketClass, newPrice });
  
      const updatedTicket = result.records[0]?.get('t')?.properties;
      if (!updatedTicket) {
        throw new Error('Le billet n\'a pas été trouvé pour la mise à jour.');
      }
  
      console.log('Billet mis à jour avec succès:', updatedTicket);
      return updatedTicket;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du billet:', error.message);
      throw new Error('Erreur lors de la mise à jour du billet');
    }
  };
  

  const deleteTicket = async (_, { ticketClass, ticketPrice }, { session }) => {
    try {
      const result = await session.run(`
        MATCH (t:Ticket)-[r:ASSIGN]->(f:Flight)
        WHERE t.class = $ticketClass AND t.price = $ticketPrice
        DELETE r, t
      `, { ticketClass, ticketPrice });
  
      if (result.summary.counters.relationshipsDeleted === 0) {
        throw new Error('Le billet n\'a pas été trouvé pour la suppression.');
      }
  
      console.log('Billet supprimé avec succès.');
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du billet:', error.message);
      throw new Error('Erreur lors de la suppression du billet');
    }
  };
  
   
  module.exports = {
    addAirport,
    updateAirport,
    deleteAirport,
    addFlight,
    updateFlight,
    deleteFlight,
    addTicket,
    updateTicket,
    deleteTicket,
  };
  