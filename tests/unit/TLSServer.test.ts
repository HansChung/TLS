import { TLSServer } from '../../src/server/TLSServer';
import { TLSServerOptions } from '../../src/types';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs module
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('TLSServer', () => {
  let serverOptions: TLSServerOptions;

  beforeEach(() => {
    serverOptions = {
      port: 8443,
      cert: '/path/to/cert.pem',
      key: '/path/to/key.pem',
      host: 'localhost',
    };

    // Mock file existence checks
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(Buffer.from('mock-cert-data'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor Validation', () => {
    it('should create a TLS server with valid options', () => {
      expect(() => new TLSServer(serverOptions)).not.toThrow();
    });

    it('should throw error for invalid port', () => {
      serverOptions.port = 0;
      expect(() => new TLSServer(serverOptions)).toThrow('Invalid port number');
    });

    it('should throw error for port above 65535', () => {
      serverOptions.port = 70000;
      expect(() => new TLSServer(serverOptions)).toThrow('Invalid port number');
    });

    it('should throw error when certificate is missing', () => {
      delete serverOptions.cert;
      expect(() => new TLSServer(serverOptions)).toThrow('Certificate and private key are required');
    });

    it('should throw error when private key is missing', () => {
      delete serverOptions.key;
      expect(() => new TLSServer(serverOptions)).toThrow('Certificate and private key are required');
    });

    it('should throw error when certificate file does not exist', () => {
      mockFs.existsSync.mockImplementation((path) => {
        return path !== serverOptions.cert;
      });

      expect(() => new TLSServer(serverOptions)).toThrow('Certificate file not found');
    });

    it('should throw error when private key file does not exist', () => {
      mockFs.existsSync.mockImplementation((path) => {
        return path !== serverOptions.key;
      });

      expect(() => new TLSServer(serverOptions)).toThrow('Private key file not found');
    });
  });

  describe('Server State Management', () => {
    let server: TLSServer;

    beforeEach(() => {
      server = new TLSServer(serverOptions);
    });

    it('should not be listening initially', () => {
      expect(server.isListening()).toBe(false);
    });

    it('should return null address when not started', () => {
      expect(server.getAddress()).toBeNull();
    });
  });

  describe('Event Handling', () => {
    let server: TLSServer;

    beforeEach(() => {
      server = new TLSServer(serverOptions);
    });

    it('should be an EventEmitter', () => {
      expect(server.on).toBeDefined();
      expect(server.emit).toBeDefined();
      expect(server.removeListener).toBeDefined();
    });

    it('should handle error events', (done) => {
      server.on('error', (error) => {
        expect(error).toBeInstanceOf(Error);
        done();
      });

      server.emit('error', new Error('Test error'));
    });

    it('should handle listening events', (done) => {
      server.on('listening', () => {
        done();
      });

      server.emit('listening');
    });
  });
});