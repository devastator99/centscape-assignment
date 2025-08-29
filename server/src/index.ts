const Fastify = require('fastify');
const rateLimit = require('@fastify/rate-limit');
const { previewRoute } = require('./routes/preview');

const fastify = Fastify({ logger: true });

// Rate limit: 10 req/min per IP
fastify.register(rateLimit, {
  max: 10,
  timeWindow: '1 minute'
});

// Register routes
fastify.register(previewRoute);

// Root route for quick check
fastify.get('/', async (_request: any, reply: any) => {
  return reply.send({
    status: 'ok',
    service: 'centscape-server',
    message: 'Use POST /preview with { url, raw_html? } to get a preview.'
  });
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log('Server running at http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
