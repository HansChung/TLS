import * as tls from 'tls';
import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';
import { TLSServerOptions, TLSConnectionInfo, Logger } from '../types';
import { DefaultLogger } from '../utils/logger';

export class TLSServer extends EventEmitter {
  private server: tls.Server | null = null;
  private options: TLSServerOptions;
  private logger: Logger;
  private isRunning = false;

  constructor(options: TLSServerOptions, logger?: Logger) {
    super();
    this.options = options;
    this.logger = logger || new DefaultLogger();
    this.validateOptions();
  }

  private validateOptions(): void {
    if (!this.options.port || this.options.port < 1 || this.options.port > 65535) {
      throw new Error('Invalid port number. Must be between 1 and 65535.');
    }

    if (!this.options.cert || !this.options.key) {
      throw new Error('Certificate and private key are required.');
    }

    if (!fs.existsSync(this.options.cert)) {
      throw new Error(`Certificate file not found: ${this.options.cert}`);
    }

    if (!fs.existsSync(this.options.key)) {
      throw new Error(`Private key file not found: ${this.options.key}`);
    }
  }

  public async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Server is already running.');
    }

    try {
      const serverOptions: tls.TlsOptions = {
        cert: fs.readFileSync(this.options.cert),
        key: fs.readFileSync(this.options.key),
        requestCert: this.options.requestCert || false,
        rejectUnauthorized: this.options.rejectUnauthorized !== false,
      };

      if (this.options.ca) {
        serverOptions.ca = fs.readFileSync(this.options.ca);
      }

      if (this.options.ciphers) {
        serverOptions.ciphers = this.options.ciphers;
      }

      this.server = tls.createServer(serverOptions, (socket) => {
        this.handleConnection(socket);
      });

      this.server.on('error', (error) => {
        this.logger.error('TLS Server error:', error);
        this.emit('error', error);
      });

      this.server.on('tlsClientError', (error, socket) => {
        this.logger.warn('TLS Client error:', error.message);
        this.emit('clientError', error, socket);
      });

      await new Promise<void>((resolve, reject) => {
        this.server!.listen(this.options.port, this.options.host || '0.0.0.0', () => {
          this.isRunning = true;
          this.logger.info(
            `TLS Server started on ${this.options.host || '0.0.0.0'}:${this.options.port}`
          );
          this.emit('listening');
          resolve();
        });

        this.server!.on('error', reject);
      });
    } catch (error) {
      this.logger.error('Failed to start TLS server:', error);
      throw error;
    }
  }

  private handleConnection(socket: tls.TLSSocket): void {
    const connectionInfo: TLSConnectionInfo = {
      protocol: socket.getProtocol() || 'unknown',
      cipher: socket.getCipher()?.name || 'unknown',
      authorized: socket.authorized,
    };

    if (socket.getPeerCertificate && socket.getPeerCertificate()) {
      const cert = socket.getPeerCertificate();
      connectionInfo.cert = {
        subject: cert.subject?.CN || 'unknown',
        issuer: cert.issuer?.CN || 'unknown',
        valid_from: cert.valid_from || '',
        valid_to: cert.valid_to || '',
        fingerprint: cert.fingerprint || '',
        serialNumber: cert.serialNumber || '',
      };
    }

    this.logger.info('New TLS connection established', connectionInfo);
    this.emit('connection', socket, connectionInfo);

    socket.on('data', (data) => {
      this.emit('data', data, socket);
    });

    socket.on('end', () => {
      this.logger.debug('TLS connection ended');
      this.emit('disconnect', socket);
    });

    socket.on('error', (error) => {
      this.logger.warn('TLS socket error:', error.message);
      this.emit('socketError', error, socket);
    });
  }

  public async stop(): Promise<void> {
    if (!this.isRunning || !this.server) {
      return;
    }

    return new Promise<void>((resolve) => {
      this.server!.close(() => {
        this.isRunning = false;
        this.logger.info('TLS Server stopped');
        this.emit('close');
        resolve();
      });
    });
  }

  public isListening(): boolean {
    return this.isRunning && this.server !== null;
  }

  public getAddress(): { address: string; family: string; port: number } | null {
    if (!this.server) return null;
    const addr = this.server.address();
    return addr && typeof addr === 'object' ? addr : null;
  }
}