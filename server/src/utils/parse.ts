const cheerio = require('cheerio');

/**
 * Parses HTML to extract preview data
 * @param {string} html - The HTML content to parse
 * @param {string} sourceUrl - The source URL
 * @returns {object} - The parsed preview data
 */
function parseHTML(html: string, sourceUrl: string): {
  title: string;
  image: string;
  price: string;
  currency: string;
  siteName: string;
  sourceUrl: string;
} {
  const $ = cheerio.load(html);

  // Open Graph
  const ogTitle = $('meta[property="og:title"]').attr('content');
  const ogImage = $('meta[property="og:image"]').attr('content');
  const ogSite = $('meta[property="og:site_name"]').attr('content');

  // Twitter Card
  const twitterTitle = $('meta[name="twitter:title"]').attr('content');
  const twitterImage = $('meta[name="twitter:image"]').attr('content');

  // Simple regex for price
  const priceMatch = html.match(/[\$₹]\s?[\d,.]+/);
  const priceContent = priceMatch ? priceMatch[0] : 'N/A';
  const currencyContent = priceMatch ? priceMatch[0][0] : '';

  // Fallback
  return {
    title: ogTitle || twitterTitle || $('title').text() || 'No Title',
    image: ogImage || twitterImage || $('img').first().attr('src') || '',
    price: priceContent || '',
    currency: currencyContent || '',
    siteName: ogSite || new URL(sourceUrl).hostname || '',
    sourceUrl
  };
}

module.exports = { parseHTML };
