const express = require('express');
const path = require('path');
const { authMiddleware } = require('./utils/auth');
const { ApolloServer } = require('@apollo/server');
const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');
const { typeDefs, resolvers } = require('./schemas');
const { expressMiddleware } = require('@apollo/server/express4');

const app = express();
const PORT = process.env.PORT || 3001;
const server = new ApolloServer(
  {
  typeDefs,
  resolvers,
  // context: authMiddleware
  });
const startApolloServer = async () => {
  await server.start();

  app.use(express.urlencoded({ extended:true }));
  app.use(express.json());

  if (process.env.NODE_env === 'production'){
    app.use(express.static(path.join(__dirname, '../client/dist')));
    app.get('*', (req,res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));

    });
  }

  app.use('/graphql', expressMiddleware(server,{
    context: authMiddleware
  }));

  db.once('open', () => {
    app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
      });
    });

};


//------------------------------------------------------------------------------------------------------------------------------
// // app.use(express.urlencoded({ extended: true }));
// app.use(express.urlencoded({ extended: false }));
// app.use(express.json());


// // Serves client/build as static assets in production
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, '../client/build')));
// }

// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, '../client/'));
//   // res.sendFile(path.join(__dirname, '../client/'));
// });

// // Apollo starts, applies middleware, and waits for the db 
// const startApolloServer = async () => {
//   await server.start();
//   server.applyMiddleware({ app });

//   db.once('open', () => {
//     app.listen(PORT, () => {
//       console.log(`API server running on port ${PORT}!`);
//       console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
//     })
//   })
// };

// // Call the async function to start the server
startApolloServer();