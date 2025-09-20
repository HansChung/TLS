# TLS Project

This is a TLS (Transport Layer Security) implementation project.

## Features

- Secure communication protocols
- Encryption and decryption capabilities
- Certificate management

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** (for JavaScript implementation)
- **OpenSSL 1.1.1+** (for cryptographic operations)
- **Git** (for version control)

## Installation

### Option 1: NPM Package (Recommended)
```bash
npm install tls-project
```

### Option 2: Build from Source
```bash
# Clone the repository
git clone https://github.com/HansChung/TLS.git
cd TLS

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

### Option 3: Docker
```bash
docker pull hanschung/tls-project:latest
docker run -p 8443:8443 hanschung/tls-project
```

## Getting Started

### Quick Start Example

```javascript
const { TLSClient, TLSServer } = require('tls-project');

// Create a TLS server
const server = new TLSServer({
  port: 8443,
  cert: './certs/server.crt',
  key: './certs/server.key'
});

server.start();
console.log('TLS server running on port 8443');

// Create a TLS client
const client = new TLSClient({
  host: 'localhost',
  port: 8443,
  rejectUnauthorized: false // For development only
});

client.connect()
  .then(() => console.log('Connected to TLS server'))
  .catch(err => console.error('Connection failed:', err));
```

### Certificate Generation

For development and testing:

```bash
# Generate private key
openssl genrsa -out server.key 2048

# Generate certificate signing request
openssl req -new -key server.key -out server.csr

# Generate self-signed certificate
openssl x509 -req -in server.csr -signkey server.key -out server.crt -days 365
```

## Contributing

Pull requests are welcome!