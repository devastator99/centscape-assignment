const Fastify = require('fastify');
const rateLimit = require('@fastify/rate-limit');
const { previewRoute } = require('./routes/preview');

export function build(opts: any = {}) {
  const fastify = Fastify(opts);

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

  return fastify;
}

if (require.main === module) {
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
}
