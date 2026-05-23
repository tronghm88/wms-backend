import { Injectable, LoggerService as NestLoggerService } from "@nestjs/common";
import * as winston from "winston";
import LokiTransport from "winston-loki";

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    const transports: winston.transport[] = [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.printf(
            ({ timestamp, level, message, context, trace }) => {
              const ctxStr = context
                ? ` [${typeof context === "string" ? context : JSON.stringify(context)}]`
                : "";
              const traceStr = trace
                ? `\n${typeof trace === "string" ? trace : JSON.stringify(trace)}`
                : "";
              return `${String(timestamp)} [${String(level)}]${ctxStr} ${String(message)}${traceStr}`;
            },
          ),
        ),
      }),
    ];

    const lokiUrl = process.env.LOKI_URL || "http://loki:3100";

    if (process.env.NODE_ENV !== "test" && lokiUrl) {
      transports.push(
        new LokiTransport({
          host: lokiUrl,
          labels: { app: "wms-backend" },
          json: true,
          format: winston.format.json(),
          replaceTimestamp: true,
          onConnectionError: (err) =>
            console.error("Loki Connection Error:", err),
        }),
      );
    }

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || "info",
      transports,
    });
  }

  log(message: unknown, context?: string) {
    this.logger.info(message as string, { context });
  }

  error(message: unknown, trace?: string, context?: string) {
    this.logger.error(message as string, { trace, context });
  }

  warn(message: unknown, context?: string) {
    this.logger.warn(message as string, { context });
  }

  debug(message: unknown, context?: string) {
    this.logger.debug(message as string, { context });
  }

  verbose(message: unknown, context?: string) {
    this.logger.verbose(message as string, { context });
  }
}
