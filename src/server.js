const app = require('./app');
const env = require('./config/env');
const { connectDb } = require('./config/db');

async function startServer() {
  await connectDb(env.mongoUri);

  app.listen(env.port, () => {
    console.log(`Server listening on port ${env.port}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Failed to start server', error);
    process.exit(1);
  });
}

module.exports = { startServer };
