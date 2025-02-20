/**
 * Interface representing a key pair with its passphrase.
 */
export interface KeyPair {
  publicKey: string;
  privateKey: string;
  passphrase: string;
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
    cipher: string;
    passphrase: string;
  };
}

/**
 * Configuration options for SecureKeyGenerator.
 */
export interface SecureKeyGeneratorConfig {
  keyDirectory?: string;
  filePermissions?: number;
  envFileName?: string;
  modulusLength?: number; // Allow customizing the RSA key size
}
