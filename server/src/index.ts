const { build } = require('./app');

const start = async () => {
  try {
    const fastify = build({ logger: true });
    const port = Number(process.env.PORT) || 3000;
    const host = '0.0.0.0';
    await fastify.listen({ port, host });
    console.log(`Server running at http://${host}:${port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
