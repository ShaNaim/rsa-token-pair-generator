import fs from "fs";
import crypto from "crypto";
import path from "path";
import dotenv from "dotenv";
import winston from "winston";
import { SecureKeyGeneratorConfig, KeyPair, KeyGenerationOptions, TokenKeyPairs } from "./interface";

dotenv.config();

/**
 * SecureKeyGenerator generates RSA key pairs for tokens and stores them securely.
 */
export class SecureKeyGenerator {
  private readonly SECURE_FILE_PERMISSIONS: number;
  private readonly KEY_DIRECTORY: string;
  private readonly keyPath: string;
  private readonly envFileName: string;
  private readonly modulusLength: number;
  private readonly logger: winston.Logger;

  constructor(config: SecureKeyGeneratorConfig = {}) {
    this.SECURE_FILE_PERMISSIONS = config.filePermissions || 0o644;
    this.KEY_DIRECTORY = config.keyDirectory || "secure-keys";
    this.keyPath = path.join(process.cwd(), this.KEY_DIRECTORY);
    this.envFileName = config.envFileName || ".env";
    this.modulusLength = config.modulusLength || 2048;

    this.logger = winston.createLogger({
      level: "info",
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
      ),
      transports: [new winston.transports.Console()],
    });
  }

  /**
   * Generates an RSA key pair.
   * @param keyType - Type of key ("access" or "refresh").
   * @returns The generated KeyPair.
   */
  private generateRSAKeyPair(keyType: "access" | "refresh"): KeyPair {
    try {
      const passphrase = this.generateSecurePassphrase();
      const options: KeyGenerationOptions = {
        modulusLength: this.modulusLength,
        publicKeyEncoding: {
          type: "spki",
          format: "pem",
        },
        privateKeyEncoding: {
          type: "pkcs8",
          format: "pem",
          cipher: "aes-256-cbc",
          passphrase,
        },
      };

      const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", options);
      this.validateKeyPair(publicKey, privateKey, passphrase);
      return { publicKey, privateKey, passphrase };
    } catch (error) {
      throw new Error(`${keyType} key generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Generates a secure random passphrase.
   * @returns A hex string representing the passphrase.
   */
  private generateSecurePassphrase(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Validates the generated key pair by signing and verifying a test message.
   * @param publicKey - The public key.
   * @param privateKey - The private key.
   * @param passphrase - The passphrase for the private key.
   */
  private validateKeyPair(publicKey: string, privateKey: string, passphrase: string): void {
    try {
      const testMessage = crypto.randomBytes(32);
      const signature = crypto.sign("sha256", testMessage, {
        key: privateKey,
        passphrase,
      });
      const isValid = crypto.verify("sha256", testMessage, publicKey, signature);

      if (!isValid) {
        throw new Error("Key pair validation failed");
      }
    } catch (error) {
      throw new Error(`Key validation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Creates the directory for storing keys with secure permissions.
   */
  private async createSecureKeyDirectory(): Promise<void> {
    try {
      if (!fs.existsSync(this.keyPath)) {
        await fs.promises.mkdir(this.keyPath, { recursive: true });
      }
      try {
        await fs.promises.chmod(this.keyPath, 0o700);
      } catch (error) {
        this.logger.warn("Could not set restrictive directory permissions. Using default permissions.");
      }
    } catch (error) {
      throw new Error(`Failed to create secure directory: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Loads existing environment variables from the configured env file.
   * @returns An object containing key/value pairs from the env file.
   */
  private async loadExistingEnv(): Promise<Record<string, string>> {
    try {
      if (fs.existsSync(this.envFileName)) {
        const envContent = await fs.promises.readFile(this.envFileName, "utf8");
        const env: Record<string, string> = {};
        envContent.split("\n").forEach((line) => {
          const trimmedLine = line.trim();
          if (trimmedLine && !trimmedLine.startsWith("#")) {
            const [key, ...valueParts] = trimmedLine.split("=");
            if (key) {
              env[key.trim()] = valueParts.join("=").replace(/^"|"$/g, "").trim();
            }
          }
        });
        return env;
      }
      return {};
    } catch (error) {
      this.logger.warn(`Could not read existing env file: ${error instanceof Error ? error.message : "Unknown error"}`);
      return {};
    }
  }

  /**
   * Writes a file with the specified permissions, with fallback on failure.
   * @param filePath - The path to the file.
   * @param content - The file content.
   * @param mode - The file permission mode.
   */
  private async writeFileWithFallback(filePath: string, content: string, mode: number): Promise<void> {
    try {
      await fs.promises.writeFile(filePath, content, { mode });
    } catch (error) {
      this.logger.warn(
        `Could not write file with restricted permissions (${mode.toString(8)}). Trying with default permissions.`
      );
      await fs.promises.writeFile(filePath, content);
    }
  }

  /**
   * Saves the generated token keys to disk and updates the environment file.
   * @param tokenKeys - The generated token key pairs.
   */
  private async saveKeys(tokenKeys: TokenKeyPairs): Promise<void> {
    try {
      await this.createSecureKeyDirectory();

      // Define file paths for keys.
      const accessPublicPath = path.join(this.keyPath, "access-public.pem");
      const accessPrivatePath = path.join(this.keyPath, "access-private.pem");
      const refreshPublicPath = path.join(this.keyPath, "refresh-public.pem");
      const refreshPrivatePath = path.join(this.keyPath, "refresh-private.pem");

      // Save key files.
      await this.writeFileWithFallback(accessPublicPath, tokenKeys.access.publicKey, this.SECURE_FILE_PERMISSIONS);
      await this.writeFileWithFallback(accessPrivatePath, tokenKeys.access.privateKey, this.SECURE_FILE_PERMISSIONS);
      await this.writeFileWithFallback(refreshPublicPath, tokenKeys.refresh.publicKey, this.SECURE_FILE_PERMISSIONS);
      await this.writeFileWithFallback(refreshPrivatePath, tokenKeys.refresh.privateKey, this.SECURE_FILE_PERMISSIONS);

      // Load existing env variables.
      const existingEnv = await this.loadExistingEnv();

      // Merge new key-related variables.
      const newEnv = {
        ...existingEnv,
        ACCESS_TOKEN_PUBLIC_KEY_PATH: accessPublicPath,
        ACCESS_TOKEN_PRIVATE_KEY_PATH: accessPrivatePath,
        ACCESS_TOKEN_PRIVATE_KEY_PASSPHRASE: tokenKeys.access.passphrase,
        ACCESS_TOKEN_PUBLIC_KEY: tokenKeys.access.publicKey,
        ACCESS_TOKEN_PRIVATE_KEY: tokenKeys.access.privateKey,
        REFRESH_TOKEN_PUBLIC_KEY_PATH: refreshPublicPath,
        REFRESH_TOKEN_PRIVATE_KEY_PATH: refreshPrivatePath,
        REFRESH_TOKEN_PRIVATE_KEY_PASSPHRASE: tokenKeys.refresh.passphrase,
        REFRESH_TOKEN_PUBLIC_KEY: tokenKeys.refresh.publicKey,
        REFRESH_TOKEN_PRIVATE_KEY: tokenKeys.refresh.privateKey,
      };

      // Convert to .env file format.
      const envContent = Object.entries(newEnv)
        .map(([key, value]) => `${key}="${value.replace(/\n/g, "\\n")}"`)
        .join("\n");

      // Save the updated env file.
      await this.writeFileWithFallback(this.envFileName, envContent, this.SECURE_FILE_PERMISSIONS);

      this.logger.info("Keys have been generated and stored successfully");
      this.printSecurityInstructions();
    } catch (error) {
      throw new Error(`Failed to save keys: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Prints security instructions to the console.
   */
  private printSecurityInstructions(): void {
    this.logger.info(`
Security Notes:
1. Key files have been generated in '${this.keyPath}'
2. Both file paths and actual keys are stored in '${this.envFileName}'
3. Access and Refresh token key pairs have been generated.
4. Ensure your .gitignore includes:
   - ${this.envFileName}
   - ${this.KEY_DIRECTORY}/
5. Consider moving keys to a secure key management service for production.
6. Backup these keys securely and never commit them to version control.
7. Previous environment variables have been preserved.

Note: If you see any permission warnings, consider manually restricting file permissions using: chmod 600 ${this.keyPath}/*.pem
    `);
  }

  /**
   * Public method to generate RSA token key pairs.
   */
  public async generate(): Promise<void> {
    try {
      const tokenKeys: TokenKeyPairs = {
        access: this.generateRSAKeyPair("access"),
        refresh: this.generateRSAKeyPair("refresh"),
      };
      await this.saveKeys(tokenKeys);
    } catch (error) {
      this.logger.error(`Error during key generation: ${error instanceof Error ? error.message : "Unknown error"}`);
      process.exit(1);
    }
  }
}

export default SecureKeyGenerator;
