const ipaddr = require('ipaddr.js');

/**
 * Checks if a hostname resolves to a private IP address
 * @param hostname Hostname to check
 * @returns True if hostname resolves to a private IP
 */
function isPrivateIP(hostname: string): boolean {
  try {
    const addr = ipaddr.parse(hostname);
    return addr.range() !== 'unicast';
  } catch (e) {
    return false;
  }
}

module.exports = { isPrivateIP };
