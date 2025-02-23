# JWT Token Pair Generator 🔐

A secure CLI utility and library for generating RSA-2048/4096 cryptographic key pairs specifically designed for JWT-based authentication systems. Generates access/refresh token key pairs with enterprise-grade security practices and seamless environment integration.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/rsa-token-pair-generator)](https://www.npmjs.com/package/jwt-token-pair-generator)

## Features 🚀

- **Military-Grade Cryptography**: Generates RSA key pairs (PKCS#8) with configurable modulus length (2048/4096 bits)
- **Secure Storage**: Writes keys to disk with strict file permissions (default: 644)
- **Environment Automation**: Auto-updates .env files with key paths and Base64-encoded values
- **Production-Ready Logging**: Integrated [Pino](https://getpino.io/) logger with structured JSON output
- **Zero Dependencies**: Uses native Node.js crypto module for key generation
- **TypeSafe API**: Full TypeScript support with declaration files
- **Configurable CLI**: Built with [Commander.js](https://github.com/tj/commander.js) for robust argument handling

## Installation 📦

### Global CLI Installation

```bash
npm install jwt-token-pair-generator
```

### As Project Dependency

```bash
npm install jwt-token-pair-generator --save-dev
```

## Usage 🛠️

### CLI Quick Start

Generate keys with default settings:

```bash
generate-token
```

This will:

1.  Create `secure-keys` directory
2.  Generate 2048-bit RSA key pair
3.  Update `.env` file with key paths
4.  Set restrictive file permissions

### Advanced CLI Usage

```bash
generate-token \
  --keyDir "my-keys" \
  --envFile ".prod.env" \
  --modulus 4096 \
  --permissions 600 \
  --log all
```

**Options**:

| Flag                   | Description                                                 | Default                  | Options                      |
| ---------------------- | ----------------------------------------------------------- | ------------------------ | ---------------------------- |
| `--keyDir <path>`      | Output directory for keys                                   | `secure-keys`            | `off`(files won't be saved ) |
| `--envFile <name>`     | Environment file to update                                  | `.env`                   |                              |
| `--modulus <bits>`     | RSA modulus length (2048/4096)                              | `2048`                   |                              |
| `--permissions <mode>` | File permission mode (octal)                                | `644`                    |                              |
| `--log <level>`        | Specifies the logging level for detailed execution tracking | `warn` / `step` (custom) | `all` (trace) `off`(No Logs) |

**Example:**

```bash
generate-token --keyDir my-keys --envFile mykeys.env --permissions 600 --modulus 4096
```

### Programmatic API

```typescript
import { SecureKeyGenerator } from "rsa-token-pair-generator";

const keyGenerator = new SecureKeyGenerator({
  keyDirectory: "config/keys",
  envFileName: ".env.production",
  modulusLength: 4096,
  filePermissions: 0o600,
});

keyGenerator
  .generate()
  .then(() => console.log("Key pair generated successfully"))
  .catch((err) => console.error("Generation failed:", err));
```

## Security Best Practices 🔒

1.  **Permission Hardening**: Always set file permissions to 600 in production
2.  **Key Rotation**: Generate new keys quarterly or per security policy
3.  **Environment Isolation**: Store private keys separate from application code
4.  **Audit Logging**: Monitor key generation events via Pino logs
5.  **CI/CD Integration**: Generate keys during deployment processes

## Logging 📝

The utility uses Pino for high-performance structured logging:

```json
{
  "time": "2025-02-23T10:06:36.536Z",
  "logLevel": "step",
  "logMessage": "RSA token key pair generation process completed successfully."
}
```

**Log Levels**:

- `all` [`warn`]: Cryptographic details (enable for troubleshooting)
- `default` [`trace`]: Generation milestones
- `off`: No Logs

Enable debug logging:

```bash
generate-token --log all
```

## Development 🧑💻

### Build from Source

```bash
git clone https://github.com/ShaNaim/rsa-token-pair-generator.git
```

```bash
cd rsa-token-pair-generator
```

```bash
npm install
```

```bash
npm run build
```

### Test Generation

```bash
# Production build test
node dist/cli.js --keyDir test-keys --modulus 2048

# Development mode (ts-node)
npx ts-node src/cli.ts --envFile .env.test
```

### Testing Recommendations

1.  Add Jest/Mocha tests for cryptographic functions
2.  Implement E2E testing for CLI workflows
3.  Add static analysis with ESLint/TypeScript
4.  Consider adding HSM integration tests

## Contributing 🤝

We welcome security-focused contributions:

1.  Fork the repository
2.  Create feature branch (`git checkout -b feature/improvement`)
3.  Commit changes with signed-off messages
4.  Push to branch (`git push origin feature/improvement`)
5.  Open Pull Request

**Priority Areas**:

- Security audits
- Cloud HSM integration
- Key encryption at rest
- Automated key rotation
- Comprehensive test suite

## License 📄

MIT License - See [LICENSE](https://github.com/ShaNaim/rsa-token-pair-generator/blob/main/LICENSE) for full text.

---

> **Note**: Always store private keys in secure vaults (AWS KMS, HashiCorp Vault) in production environments.
