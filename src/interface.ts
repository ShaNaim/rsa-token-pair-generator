import pino from "pino";
/**
 * Interface representing a key pair with its passphrase.
 */
export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

/**
 * Interface representing token key pairs for access and refresh tokens.
 */
export interface TokenKeyPairs {
  access: KeyPair;
  refresh: KeyPair;
}

/**
 * Options for generating RSA keys.
 */
export interface KeyGenerationOptions {
  modulusLength: number;
  publicKeyEncoding: {
    type: "spki";
    format: "pem";
  };
  privateKeyEncoding: {
    type: "pkcs8";
    format: "pem";
  };
}

/**
 * Configuration options for SecureKeyGenerator.
 */
export interface SecureKeyGeneratorConfig {
  keyDirectory?: string;
  filePermissions?: number;
  envFileName?: string;
  modulusLength?: number;
  logLevel?: string;
}

// Interface for the log entry structure
export interface LogEntry {
  time: string;
  logLevel: string;
  logMessage: string;
}

// Define custom log function type
export type LogFn = (msg: string, ...args: any[]) => void;

// Custom logger interface that includes the step method
export interface StepLogger extends pino.Logger {
  step: LogFn;
}

// Type for including both built-in and custom levels
export type LogLevels = pino.Level | "step";
