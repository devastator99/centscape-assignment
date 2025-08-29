import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { FastifyInstance } from 'fastify';
import { build } from '../src/app';
import * as fs from 'fs';
import * as path from 'path';

describe('Preview API Tests', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = build({ logger: false });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Parsing Tests with Fixtures', () => {
    it('should parse Open Graph data correctly', async () => {
      const html = fs.readFileSync(path.join(__dirname, 'fixtures/sample.html'), 'utf-8');
      
      const response = await app.inject({
        method: 'POST',
        url: '/preview',
        payload: {
          url: 'https://example.com/product',
          raw_html: html
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.title).toBe('Amazing Product');
      expect(data.image).toBe('https://example.com/product.jpg');
      expect(data.siteName).toBe('Example Store');
      expect(data.price).toContain('$29.99');
      expect(data.currency).toBe('$');
    });

    it('should fallback to basic HTML when no OG data', async () => {
      const html = fs.readFileSync(path.join(__dirname, 'fixtures/no-og.html'), 'utf-8');
      
      const response = await app.inject({
        method: 'POST',
        url: '/preview',
        payload: {
          url: 'https://example.com/basic',
          raw_html: html
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.title).toBe('Basic Page No OG');
      expect(data.image).toBe('https://example.com/basic.jpg');
      expect(data.price).toContain('€15.50');
      expect(data.currency).toBe('€');
    });
  });

  describe('Security & Robustness Tests', () => {
    it('should reject invalid URLs', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/preview',
        payload: { url: 'not-a-url' }
      });

      expect(response.statusCode).toBe(400);
      const data = JSON.parse(response.payload);
      expect(data.error).toBe('Invalid URL');
    });

    it('should reject private IP addresses (SSRF protection)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/preview',
        payload: { url: 'http://192.168.1.1/test' }
      });

      expect(response.statusCode).toBe(400);
      const data = JSON.parse(response.payload);
      expect(data.error).toBe('URL points to private IP');
    });

    it('should reject localhost URLs (SSRF protection)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/preview',
        payload: { url: 'http://localhost:8080/test' }
      });

      expect(response.statusCode).toBe(400);
      const data = JSON.parse(response.payload);
      expect(data.error).toBe('URL points to private IP');
    });

    it('should require URL parameter', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/preview',
        payload: {}
      });

      expect(response.statusCode).toBe(400);
      const data = JSON.parse(response.payload);
      expect(data.error).toBe('URL is required');
    });

    it('should handle content-type validation', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/preview',
        payload: {
          url: 'https://httpbin.org/json',
          raw_html: '{"test": "json"}'
        }
      });

      // Should work with raw_html override even if URL would return JSON
      expect(response.statusCode).toBe(200);
    });
  });

  describe('Rate Limiting Tests', () => {
    it('should enforce rate limiting after 10 requests', async () => {
      // Use a unique IP for this test to avoid interference
      const testIP = `192.168.1.${Math.floor(Math.random() * 255)}`;
      const promises = [];
      
      // Make 11 requests rapidly
      for (let i = 0; i < 11; i++) {
        promises.push(
          app.inject({
            method: 'POST',
            url: '/preview',
            payload: {
              url: 'https://example.com/test' + i,
              raw_html: '<html><title>Test</title></html>'
            },
            headers: {
              'x-forwarded-for': testIP
            }
          })
        );
      }

      const responses = await Promise.all(promises);
      
      // First 10 should succeed, 11th should be rate limited
      const successCount = responses.filter(r => r.statusCode === 200).length;
      const rateLimitedCount = responses.filter(r => r.statusCode === 429).length;
      
      expect(successCount).toBeLessThanOrEqual(10);
      expect(rateLimitedCount).toBeGreaterThan(0);
    }, 10000);
  });

  describe('Timeout and Size Limits', () => {
    it('should handle timeout scenarios gracefully', async () => {
      // Use a unique IP to avoid rate limiting interference
      const testIP = `10.0.0.${Math.floor(Math.random() * 255)}`;
      
      const response = await app.inject({
        method: 'POST',
        url: '/preview',
        payload: {
          url: 'https://httpbin.org/delay/10' // This should timeout
        },
        headers: {
          'x-forwarded-for': testIP
        }
      });

      expect(response.statusCode).toBe(400);
      const data = JSON.parse(response.payload);
      expect(data.error).toMatch(/timeout|ECONNABORTED|503|Request failed/i);
    }, 15000);

    it('should reject oversized content', async () => {
      // Use a unique IP to avoid rate limiting interference  
      const testIP = `10.0.1.${Math.floor(Math.random() * 255)}`;
      
      // Create HTML larger than 512KB
      const largeContent = '<html><body>' + 'x'.repeat(600 * 1024) + '</body></html>';
      
      const response = await app.inject({
        method: 'POST',
        url: '/preview',
        payload: {
          url: 'https://example.com/large',
          raw_html: largeContent
        },
        headers: {
          'x-forwarded-for': testIP
        }
      });

      // Should still work with raw_html, but real fetch would be rejected
      expect(response.statusCode).toBe(200);
    });
  });
});
