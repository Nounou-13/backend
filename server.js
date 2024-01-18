// server.js
const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const neo4j = require('neo4j-driver');
const mutations = require('./mutations');
const queries = require('./queries');
const { driver, session } = require('./neo4j');

const app = express();

const typeDefs = gql`
  type Mutation {
    addAirport(name: String!): Airport
    updateAirport(oldName: String!, newName: String!): Airport
    deleteAirport(name: String!): Boolean
    addFlight(date: String!, duration: Int!, distance: Int!, airline: String!, origin: String!, destination: String!): Flight
    updateFlight(date: String!, duration: Int!, distance: Int!, airline: String!, origin: String!, destination: String!): Flight
    deleteFlight(date: String!): Boolean
    addTicket(ticketClass: String!, price: Float!, flightDate: String!): Ticket
      updateTicket(
        ticketClass: String!
        ticketPrice: Float!  # Nouveau paramètre pour utiliser le prix comme critère de recherche
        newTicketClass: String
        newPrice: Float
      ): Ticket
    
    deleteTicket(ticketClass: String!, ticketPrice: Float!): Boolean
  }

  type Airport {
    name: String!
  }

  type Flight {
    date: String!
    duration: Int!
    distance: Int!
    airline: String!
    origin: Airport
    destination: Airport
    tickets: [Ticket]
  }

  type Ticket {
    ticketClass: String!
    price: Float!
    flight: Flight
  }

  type Query {
    allAirports: [Airport!]!
    allFlights: [Flight!]!
    allTickets: [Ticket!]!
    tickets: [TicketInfo]  # Nouveau type pour la relation entre les billets et les vols
  }

  type TicketInfo {
    ticket: Ticket!
    flight: Flight!
  }
`;

const resolvers = {
  Mutation: {
    addAirport: mutations.addAirport,
    updateAirport: mutations.updateAirport,
    deleteAirport: mutations.deleteAirport,
    addFlight: mutations.addFlight,
    updateFlight: mutations.updateFlight,
    deleteFlight: mutations.deleteFlight,
    addTicket: mutations.addTicket,
    updateTicket: mutations.updateTicket,
    deleteTicket: mutations.deleteTicket,
  },
  Query: {
    allAirports: queries.allAirports,
    allFlights: queries.allFlights,
    allTickets: queries.allTickets,
    tickets: queries.tickets,
  },
  Flight: {
    origin: queries.origin,
    destination: queries.destination,
    tickets: queries.tickets,
  },
  Ticket: {
    flight: queries.flight,
  },
  TicketInfo: {
    ticket: (parent) => parent.ticket,
    flight: (parent) => parent.flight,
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: { driver, session },
});

const startServer = async () => {
  await server.start();
  server.applyMiddleware({ app });
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`Serveur GraphQL en cours d'exécution sur http://localhost:${port}${server.graphqlPath}`);
  });
};

startServer();
