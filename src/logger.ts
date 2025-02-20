import pino from "pino";
import pretty from "pino-pretty";
import fs from "fs/promises";
import path from "path";
import { LogEntry, LogLevels, StepLogger } from "./interface";

// Define custom levels
const customLevels = {
  step: 50, // Between info (30) and warn (40)
} as const;

class AsyncFileWriter {
  private queue: LogEntry[] = [];
  private isWriting = false;
  private logFilePath: string;

  constructor(logFilePath: string) {
    this.logFilePath = logFilePath;
    this.initializeFile();
  }

  private async initializeFile(): Promise<void> {
    try {
      // Create directory if it doesn't exist
      await fs.mkdir(path.dirname(this.logFilePath), { recursive: true });

      // Create file if it doesn't exist
      try {
        await fs.access(this.logFilePath);
      } catch {
        await fs.writeFile(this.logFilePath, "[]", "utf-8");
      }
    } catch (error) {
      console.error("Error initializing log file:", error);
    }
  }

  async addToQueue(entry: LogEntry): Promise<void> {
    this.queue.push(entry);
    if (!this.isWriting) {
      await this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.queue.length === 0 || this.isWriting) {
      return;
    }

    this.isWriting = true;

    try {
      // Read existing logs
      let logs: LogEntry[] = [];
      try {
        const content = await fs.readFile(this.logFilePath, "utf-8");
        logs = JSON.parse(content);
      } catch (error) {
        logs = [];
      }

      // Add new logs from queue
      logs.push(...this.queue);
      this.queue = [];

      // Write all logs back to file with pretty formatting
      await fs.writeFile(this.logFilePath, JSON.stringify(logs, null, 2), "utf-8");
    } catch (error) {
      console.error("Error writing to log file:", error);
    } finally {
      this.isWriting = false;

      // If more logs were added while writing, process them
      if (this.queue.length > 0) {
        await this.processQueue();
      }
    }
  }
}

// Create and configure the logger
const createLogger = (
  logLevel?: string,
  logFilePath: string = path.join(process.cwd(), "logs", "log.json")
): StepLogger => {
  const fileWriter = new AsyncFileWriter(logFilePath);

  // Configure pino-pretty stream
  const prettyStream = pretty({
    colorize: true,
    levelFirst: true,
    translateTime: "SYS:standard",
    customColors: "step:magenta",
    customLevels: "step:35",
    customPrettifiers: {
      time: (timestamp) => `🕒 ${timestamp}`,
      step: (level) => "👉 STEP",
    },
  });

  // Custom destination function for file writing
  const fileDestination = (msg: string): void => {
    try {
      const logObject = JSON.parse(msg);
      const entry: LogEntry = {
        time: new Date(logObject.time).toISOString(),
        logLevel: logObject.level,
        logMessage: logObject.msg,
      };

      // Use setImmediate to make it non-blocking
      setImmediate(() => {
        fileWriter.addToQueue(entry).catch(console.error);
      });
    } catch (error) {
      console.error("Error processing log:", error);
    }
  };

  const logger = pino(
    {
      customLevels: customLevels,
      useOnlyCustomLevels: false,
      level: logLevel || "warn",
      formatters: {
        level: (label: string) => ({ level: label }),
      },
    },
    pino.multistream([{ stream: prettyStream }, { stream: { write: fileDestination } }])
  ) as unknown as StepLogger;

  return logger;
};

// Export singleton instance
export const logger = createLogger;
export type { LogEntry, StepLogger as CustomLogger, LogLevels };
