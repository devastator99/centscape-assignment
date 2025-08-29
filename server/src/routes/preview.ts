const fastify = require('fastify');
const types = require('../types');
const { fetchHTML } = require('../utils/fetch');
const { parseHTML } = require('../utils/parse');
const { isPrivateIP } = require('../utils/ip');
const urlLib = require('url');

/**
 * @param {import('fastify').FastifyInstance} fastify
 */
async function previewRoute(fastify: any) {
  fastify.post('/preview', async (request: any, reply: any) => {
    const { url, raw_html } = request.body;

    if (!url) return reply.status(400).send({ error: 'URL is required' });

    // Validate URL
    let hostname;
    try {
      hostname = new URL(url).hostname;
    } catch {
      return reply.status(400).send({ error: 'Invalid URL' });
    }

    if (isPrivateIP(hostname)) {
      return reply.status(400).send({ error: 'URL points to private IP' });
    }

    try {
      const html = raw_html || await fetchHTML(url);
      const preview = parseHTML(html, url);
      return preview;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return reply.status(400).send({ error: errorMessage });
    }
  });
}

module.exports = { previewRoute };
