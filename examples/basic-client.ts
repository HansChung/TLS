import { TLSClient, DefaultLogger } from '../src';

async function main(): Promise<void> {
  const logger = new DefaultLogger('info');

  const client = new TLSClient({
    host: 'localhost',
    port: 8443,
    rejectUnauthorized: false, // For development only
    timeout: 5000,
  }, logger);

  // Handle connection
  client.on('connect', (connectionInfo) => {
    console.log('Connected to TLS server:', connectionInfo);

    // Send some data
    client.write('Hello from TLS Client!\n');
  });

  // Handle data from server
  client.on('data', (data) => {
    console.log('Received from server:', data.toString());
  });

  // Handle connection end
  client.on('end', () => {
    console.log('Server ended the connection');
  });

  // Handle connection close
  client.on('close', () => {
    console.log('Connection closed');
  });

  // Handle errors
  client.on('error', (error) => {
    console.error('Client error:', error);
  });

  // Handle timeout
  client.on('timeout', () => {
    console.log('Connection timed out');
  });

  try {
    await client.connect();

    // Send periodic messages
    const interval = setInterval(() => {
      if (client.isActive()) {
        client.write(`Message at ${new Date().toISOString()}\n`);
      } else {
        clearInterval(interval);
      }
    }, 2000);

    // Disconnect after 10 seconds
    setTimeout(async () => {
      clearInterval(interval);
      await client.disconnect();
      console.log('Client disconnected');
    }, 10000);

  } catch (error) {
    console.error('Failed to connect:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}