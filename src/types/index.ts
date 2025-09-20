export interface TLSServerOptions {
  port: number;
  host?: string;
  cert: string;
  key: string;
  ca?: string;
  requestCert?: boolean;
  rejectUnauthorized?: boolean;
  ciphers?: string;
  secureProtocol?: string;
}

export interface TLSClientOptions {
  host: string;
  port: number;
  cert?: string;
  key?: string;
  ca?: string;
  rejectUnauthorized?: boolean;
  servername?: string;
  timeout?: number;
}

export interface CertificateInfo {
  subject: string;
  issuer: string;
  valid_from: string;
  valid_to: string;
  fingerprint: string;
  serialNumber: string;
}

export interface TLSConnectionInfo {
  protocol: string;
  cipher: string;
  authorized: boolean;
  cert?: CertificateInfo;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

export interface TLSError extends Error {
  code?: string;
  syscall?: string;
  errno?: number;
}