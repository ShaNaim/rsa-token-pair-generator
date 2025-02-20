#!/usr/bin/env node
import { Command } from "commander";
import SecureKeyGenerator from "./index";

const program = new Command();

program
  .version("1.0.0")
  .description("Generate RSA token key pairs for access and refresh tokens")
  .option("--keyDir <directory>", "Directory where keys will be stored", "secure-keys")
  .option("--envFile <filename>", "Environment file to update", ".env")
  .option("--permissions <mode>", "File permissions in octal (e.g. 600)", "644")
  .option("--modulus <length>", "RSA modulus length", "2048")
  .option("--log <level>", "Logging level (default: minimal, use 'all' for verbose)", "minimal")
  .parse(process.argv);

const options = program.opts();

const config = {
  keyDirectory: options.keyDir,
  envFileName: options.envFile,
  filePermissions: parseInt(options.permissions, 8),
  modulusLength: parseInt(options.modulus, 10),
  logLevel: options.log === "all" ? "trace" : "warn",
};

const generator = new SecureKeyGenerator(config);
generator.generate();
