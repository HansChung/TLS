import * as tls from 'tls';
import * as fs from 'fs';
import { EventEmitter } from 'events';
import { TLSClientOptions, TLSConnectionInfo, Logger } from '../types';
import { DefaultLogger } from '../utils/logger';

export class TLSClient extends EventEmitter {
  private socket: tls.TLSSocket | null = null;
  private options: TLSClientOptions;
  private logger: Logger;
  private isConnected = false;

  constructor(options: TLSClientOptions, logger?: Logger) {
    super();
    this.options = options;
    this.logger = logger || new DefaultLogger();
    this.validateOptions();
  }

  private validateOptions(): void {
    if (!this.options.host) {
      throw new Error('Host is required.');
    }

    if (!this.options.port || this.options.port < 1 || this.options.port > 65535) {
      throw new Error('Invalid port number. Must be between 1 and 65535.');
    }

    if (this.options.cert && !fs.existsSync(this.options.cert)) {
      throw new Error(`Certificate file not found: ${this.options.cert}`);
    }

    if (this.options.key && !fs.existsSync(this.options.key)) {
      throw new Error(`Private key file not found: ${this.options.key}`);
    }

    if (this.options.ca && !fs.existsSync(this.options.ca)) {
      throw new Error(`CA file not found: ${this.options.ca}`);
    }
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      throw new Error('Client is already connected.');
    }

    return new Promise<void>((resolve, reject) => {
      const connectOptions: tls.ConnectionOptions = {
        host: this.options.host,
        port: this.options.port,
        rejectUnauthorized: this.options.rejectUnauthorized !== false,
        servername: this.options.servername || this.options.host,
      };

      if (this.options.cert) {
        connectOptions.cert = fs.readFileSync(this.options.cert);
      }

      if (this.options.key) {
        connectOptions.key = fs.readFileSync(this.options.key);
      }

      if (this.options.ca) {
        connectOptions.ca = fs.readFileSync(this.options.ca);
      }

      this.socket = tls.connect(connectOptions, () => {
        this.isConnected = true;
        const connectionInfo = this.getConnectionInfo();
        this.logger.info('TLS connection established', connectionInfo);
        this.emit('connect', connectionInfo);
        resolve();
      });

      this.socket.on('data', (data) => {
        this.emit('data', data);
      });

      this.socket.on('end', () => {
        this.isConnected = false;
        this.logger.debug('TLS connection ended');
        this.emit('end');
      });

      this.socket.on('close', () => {
        this.isConnected = false;
        this.logger.debug('TLS connection closed');
        this.emit('close');
      });

      this.socket.on('error', (error) => {
        this.isConnected = false;
        this.logger.error('TLS connection error:', error);
        this.emit('error', error);
        reject(error);
      });

      if (this.options.timeout) {
        this.socket.setTimeout(this.options.timeout, () => {
          this.logger.warn('TLS connection timeout');
          this.emit('timeout');
          this.disconnect();
        });
      }
    });
  }

  public write(data: string | Buffer): boolean {
    if (!this.socket || !this.isConnected) {
      throw new Error('Client is not connected.');
    }

    return this.socket.write(data);
  }

  public async disconnect(): Promise<void> {
    if (!this.socket || !this.isConnected) {
      return;
    }

    return new Promise<void>((resolve) => {
      this.socket!.end(() => {
        this.isConnected = false;
        this.logger.info('TLS client disconnected');
        resolve();
      });
    });
  }

  public getConnectionInfo(): TLSConnectionInfo | null {
    if (!this.socket || !this.isConnected) {
      return null;
    }

    const connectionInfo: TLSConnectionInfo = {
      protocol: this.socket.getProtocol() || 'unknown',
      cipher: this.socket.getCipher()?.name || 'unknown',
      authorized: this.socket.authorized,
    };

    if (this.socket.getPeerCertificate && this.socket.getPeerCertificate()) {
      const cert = this.socket.getPeerCertificate();
      connectionInfo.cert = {
        subject: cert.subject?.CN || 'unknown',
        issuer: cert.issuer?.CN || 'unknown',
        valid_from: cert.valid_from || '',
        valid_to: cert.valid_to || '',
        fingerprint: cert.fingerprint || '',
        serialNumber: cert.serialNumber || '',
      };
    }

    return connectionInfo;
  }

  public isActive(): boolean {
    return this.isConnected && this.socket !== null;
  }

  public getSocket(): tls.TLSSocket | null {
    return this.socket;
  }
}