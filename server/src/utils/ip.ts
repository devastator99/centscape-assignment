const ipaddr = require('ipaddr.js');

/**
 * Checks if a hostname resolves to a private IP address
 * @param hostname Hostname to check
 * @returns True if hostname resolves to a private IP
 */
function isPrivateIP(hostname: string): boolean {
  try {
    // Check for localhost variations
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
      return true;
    }
    
    const addr = ipaddr.parse(hostname);
    return addr.range() !== 'unicast';
  } catch (e) {
    // If parsing fails, check for localhost string
    return hostname.toLowerCase() === 'localhost';
  }
}

module.exports = { isPrivateIP };
