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

  // oEmbed discovery
  let oembedTitle = '';
  let oembedImage = '';
  const oembedLink = $('link[type="application/json+oembed"]').attr('href');
  if (oembedLink) {
    // Note: In production, you'd fetch this URL, but for assignment we'll just mark it as discovered
    oembedTitle = $('meta[name="oembed:title"]').attr('content') || '';
    oembedImage = $('meta[name="oembed:image"]').attr('content') || '';
  }

  // Enhanced price detection with multiple currencies and formats
  const priceRegex = /(?:[\$₹€£¥]|USD|EUR|GBP|INR)\s?[\d,.]+(?: ?(?:USD|EUR|GBP|INR))?/gi;
  const priceMatches = html.match(priceRegex);
  const priceContent = priceMatches ? priceMatches[0] : '';
  
  // Extract currency from price
  const currencyMatch = priceContent.match(/[\$₹€£¥]|USD|EUR|GBP|INR/i);
  const currencyContent = currencyMatch ? currencyMatch[0] : '';

  // Extraction order: Open Graph → Twitter Card → oEmbed → fallback
  return {
    title: ogTitle || twitterTitle || oembedTitle || $('title').text() || 'No Title',
    image: ogImage || twitterImage || oembedImage || $('img').first().attr('src') || '',
    price: priceContent || '',
    currency: currencyContent || '',
    siteName: ogSite || new URL(sourceUrl).hostname || '',
    sourceUrl
  };
}

module.exports = { parseHTML };
