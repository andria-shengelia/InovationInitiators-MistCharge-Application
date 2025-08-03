const os = require('os');

function getNetworkIP() {
  const interfaces = os.networkInterfaces();
  
  // Look for the primary network interface (usually wlo1 for WiFi or eth0 for Ethernet)
  for (const name of Object.keys(interfaces)) {
    const interface = interfaces[name];
    
    // Skip loopback and virtual interfaces
    if (name === 'lo' || name.includes('docker') || name.includes('virbr') || name.includes('br-')) {
      continue;
    }
    
    for (const addr of interface) {
      // Look for IPv4 addresses that are not internal
      if (addr.family === 'IPv4' && !addr.internal) {
        return addr.address;
      }
    }
  }
  
  // Fallback to localhost if no external IP found
  return '127.0.0.1';
}

function getNetworkInfo() {
  const ip = getNetworkIP();
  const hostname = os.hostname();
  
  return {
    ip,
    hostname,
    timestamp: new Date().toISOString()
  };
}

// Export for use in other modules
module.exports = {
  getNetworkIP,
  getNetworkInfo
};

// If run directly, print the IP
if (require.main === module) {
  const info = getNetworkInfo();
  console.log(JSON.stringify(info, null, 2));
} 