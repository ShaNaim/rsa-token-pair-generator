# RSA Token Pair Generator

A secure CLI and library for generating RSA token key pairs for access and refresh tokens. This tool securely generates RSA keys, validates them, writes them to disk with restricted permissions, and updates an environment file with key details. It is designed following industry best practices and is fully configurable.

## Features

- **Secure Key Generation:** Generates RSA key pairs (for access and refresh tokens) with customizable modulus length.
- **Configurable Storage:** Save keys in a dedicated directory with strict file permissions.
- **Automated Environment Updates:** Automatically update a specified `.env` (or custom) file with key paths and values.
- **Robust CLI:** Built with [Commander](https://www.npmjs.com/package/commander) for easy and reliable argument parsing.
- **Enhanced Logging:** Uses [Winston](https://www.npmjs.com/package/winston) for improved logging and error reporting.

## Installation

### Global Installation (CLI)

Install the package globally using npm so you can run the CLI command from anywhere:

```bash
npm install -g rsa-token-pair-generator
```

### Local Installation (Library)

Or install as a dependency in your project:

```bash
npm install rsa-token-pair-generator
```

## Usage

### Running as a CLI Tool

Once installed globally, you can run the CLI command:

```bash
generate-token [options]
```

#### Available Options

- `--keyDir <directory>`: Directory where keys will be stored (default: `secure-keys`).
- `--envFile <filename>`: Environment file to update (default: `.env`).
- `--permissions <mode>`: File permissions in octal (e.g. `600`, default: `644`).
- `--modulus <length>`: RSA modulus length (default: `2048`).

**Example:**

```bash
generate-token --keyDir my-keys --envFile mykeys.env --permissions 600 --modulus 4096
```

This command will:

- Generate a 4096-bit RSA key pair.
- Store the keys in the `my-keys/` directory.
- Update the `mykeys.env` file with key paths and values.
- Set file permissions to `600` (if supported by your OS).

### Using as a Library

You can also import and use the key generator in your own Node.js projects:

```typescript
import SecureKeyGenerator from "rsa-token-pair-generator;

const generator = new SecureKeyGenerator({
  keyDirectory: "my-keys",
  envFileName: "mykeys.env",
  filePermissions: parseInt("600", 8),
  modulusLength: 4096
});

generator.generate()
  .then(() => console.log("Keys generated successfully!"))
  .catch((error) => console.error("Error generating keys:", error));`
```

## Testing

### Local Development Test Run

1.  **Install Dependencies:**

```bash
npm install
```

2.  **Build the Project:**

    Compile your TypeScript code:

```bash
npm run build
```

3.  **Run the Compiled CLI:**

```bash
node dist/cli.js --keyDir test-keys --envFile test.env --permissions 600 --modulus 4096
```

4.  **Directly Run with ts-node (Development Mode):**

    If you prefer to run without compiling:

```bash
npx ts-node src/cli.ts --keyDir test-keys --envFile test.env --permissions 600 --modulus 4096
```

5.  **Verify Output:**

    Check that the keys are generated in the specified directory:

```bash
ls -l test-keys/
cat test.env
```

### Automated Testing

Currently, no test suite is provided. It is recommended to add tests using a framework such as Jest or Mocha. Contributions with tests are welcome!

## Modifying the Package

### Configuration

- **Custom Settings:** You can modify defaults (like the RSA modulus length, key directory, environment file, or file permissions) via CLI options or when instantiating the `SecureKeyGenerator` class.
- **Logging:** Adjust the Winston logger configuration in `src/index.ts` to change log levels or output formats.
- **RSA Parameters:** The RSA key generation options can be extended to include different ciphers or key formats if required.

### Contributing

Contributions, bug reports, and feature requests are welcome. Please fork the repository, make your changes following the existing code style, and submit a pull request. Adding tests and improving documentation are highly appreciated.

## License

This project is licensed under the ISC License.

## Contact

For questions or further assistance, please contact Your Name.
