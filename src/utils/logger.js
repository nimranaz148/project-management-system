import winston from "winston";

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        // Save errors to error.log
        new winston.transports.File({ filename: "logs/error.log", level: "error" }),
        // Save all logs (info, error, etc.) to combined.log
        new winston.transports.File({ filename: "logs/combined.log" }),
    ],
});

// If we are not in production, also log to the console
if (process.env.NODE_ENV !== "production") {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

export default logger;
