// neo4j.js

const neo4j = require('neo4j-driver');

const neo4jUri = 'neo4j+s://d0d32af8.databases.neo4j.io';
const neo4jUser = 'neo4j';
const neo4jPassword = 'iFiC7oamezB05tXMc6lgYC_CGRxGwFFb5YiXwMOvvLg';

const driver = neo4j.driver(neo4jUri, neo4j.auth.basic(neo4jUser, neo4jPassword));
const session = driver.session();

module.exports = { driver, session };
