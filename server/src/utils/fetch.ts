const axios = require('axios');

/**
 * Fetches HTML content from a URL
 * @param {string} url - The URL to fetch
 * @returns {Promise<string>} - The HTML content
 */
async function fetchHTML(url: string): Promise<string> {
  try {
    const response = await axios.get(url, {
      timeout: 5000,              // ≤5s
      maxRedirects: 3,            // max 3 redirects
      headers: { 'User-Agent': 'CentscapeBot/1.0' },
      responseType: 'text',
      validateStatus: (status: number) => status === 200,
      maxContentLength: 512 * 1024 // 512 KB
    });

    if (!response.headers['content-type']?.includes('text/html')) {
      throw new Error('Invalid content-type');
    }

    return response.data;
  } catch (error: any) {
    // Handle specific error codes
    if (error.response) {
      const status: number = error.response.status;
      if (status === 404) {
        // Handle 404 error
      }
    }
    throw error;
  }

}

module.exports = { fetchHTML };
