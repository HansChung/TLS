import { TLSServer, DefaultLogger } from '../src';

async function main(): Promise<void> {
  const logger = new DefaultLogger('info');

  const server = new TLSServer({
    port: 8443,
    host: 'localhost',
    cert: './certs/server.crt',
    key: './certs/server.key',
    rejectUnauthorized: false, // For development only
  }, logger);

  // Handle connections
  server.on('connection', (socket, connectionInfo) => {
    console.log('New client connected:', connectionInfo);

    socket.write('Hello from TLS Server!\n');
  });

  // Handle data from clients
  server.on('data', (data, socket) => {
    console.log('Received data:', data.toString());
    socket.write(`Echo: ${data.toString()}`);
  });

  // Handle client disconnections
  server.on('disconnect', (socket) => {
    console.log('Client disconnected');
  });

  // Handle errors
  server.on('error', (error) => {
    console.error('Server error:', error);
  });

  try {
    await server.start();
    console.log('TLS Server is running on https://localhost:8443');

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\nShutting down server...');
      await server.stop();
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}