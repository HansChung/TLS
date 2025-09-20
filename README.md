# TLS Project

*English | [繁體中文](README.zh-TW.md)*

This is a TLS (Transport Layer Security) implementation project.

## Features

- **TLS 1.2 & 1.3 Support**: Complete implementation of modern TLS protocols
- **Advanced Encryption**: Support for AEAD cipher suites (AES-GCM, ChaCha20-Poly1305)
- **Certificate Management**: X.509 certificate chain verification and management
- **Perfect Forward Secrecy**: ECDHE key exchange support

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

## Project Structure

```
TLS/
├── src/                 # Main source code
│   ├── client/         # TLS client implementation
│   ├── server/         # TLS server implementation
│   ├── crypto/         # Cryptographic utilities
│   ├── utils/          # Utility classes
│   └── types/          # TypeScript type definitions
├── tests/              # Test files
│   ├── unit/           # Unit tests
│   └── integration/    # Integration tests
├── examples/           # Usage examples
├── scripts/            # Development scripts
├── certs/              # Certificate files (development)
└── docs/               # Documentation
```

## Development Commands

```bash
# Run in development mode
npm run dev

# Build the project
npm run build

# Run tests
npm test

# Watch mode testing
npm run test:watch

# Coverage report
npm run test:coverage

# Lint code
npm run lint

# Auto-fix code style
npm run lint:fix

# Format code
npm run format

# Clean build files
npm run clean
```

## API Documentation

### TLSServer Class

Create and manage TLS server connections.

```typescript
import { TLSServer, TLSServerOptions } from 'tls-project';

const options: TLSServerOptions = {
  port: 8443,
  host: 'localhost',
  cert: './certs/server.crt',
  key: './certs/server.key',
  requestCert: false,
  rejectUnauthorized: true
};

const server = new TLSServer(options);
```

#### Events

- `listening` - Server starts listening
- `connection` - New client connection
- `data` - Data received
- `disconnect` - Client disconnected
- `error` - Server error

### TLSClient Class

Create and manage TLS client connections.

```typescript
import { TLSClient, TLSClientOptions } from 'tls-project';

const options: TLSClientOptions = {
  host: 'localhost',
  port: 8443,
  timeout: 5000,
  rejectUnauthorized: true
};

const client = new TLSClient(options);
```

#### Events

- `connect` - Connection established
- `data` - Data received
- `end` - Connection ended
- `close` - Connection closed
- `error` - Connection error
- `timeout` - Connection timeout

## Security Considerations

### Development Environment

- Use `rejectUnauthorized: false` only for development and testing
- Self-signed certificates should not be used in production
- Regularly update dependencies for security patches

### Production Environment

- Use certificates from trusted Certificate Authorities
- Enable strict certificate validation
- Regularly rotate certificates and private keys
- Monitor TLS connections and anomalous activity

## Performance Optimization

### Connection Management

- Use connection pooling for multiple clients
- Implement proper timeout and retry mechanisms
- Monitor memory usage and connection leaks

### Encryption Performance

- Choose appropriate cipher suites
- Enable TLS session reuse
- Consider hardware acceleration support

## Troubleshooting

### Common Issues

**Certificate Errors**
```bash
# Check certificate validity
openssl x509 -in server.crt -text -noout

# Verify private key matches
openssl x509 -noout -modulus -in server.crt | openssl md5
openssl rsa -noout -modulus -in server.key | openssl md5
```

**Connection Issues**
- Check firewall settings
- Verify port availability
- Ensure certificate paths are correct

**Performance Issues**
- Enable verbose logging
- Monitor system resource usage
- Check network latency

## Contributing

We welcome community contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style
- Add tests for new features
- Update relevant documentation
- Ensure all tests pass

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

- **Author**: HansChung
- **Project Link**: https://github.com/HansChung/TLS
- **Issue Tracker**: https://github.com/HansChung/TLS/issues

## Acknowledgments

Thanks to all contributors and the open-source community for their support.

---

**⚠️ Important**: This project is intended for educational and development purposes. Please ensure proper security assessment and testing before using in production environments.