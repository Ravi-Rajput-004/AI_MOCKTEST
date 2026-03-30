import https from 'https';
import http from 'http';
import { logger } from '../config/logger.js';

/**
 * Initiates a self-pinger that hits the server's health check endpoint
 * every 14 minutes to prevent the Render free tier from sleeping.
 * 
 * @param {string} url - The base URL of the application.
 */
export const startSelfPinger = (url) => {
  if (!url) {
    logger.warn('Self-pinger: APP_URL not provided, skipping self-ping.');
    return;
  }

  const pingUrl = `${url.replace(/\/$/, '')}/api/v1/health`;
  const protocol = url.startsWith('https') ? https : http;

  logger.info(`Self-pinger: Started. Target: ${pingUrl}`);

  // Ping every 14 minutes (14 * 60 * 1000 ms)
  setInterval(() => {
    logger.info(`Self-pinger: Sending ping to ${pingUrl}...`);

    protocol.get(pingUrl, (res) => {
      if (res.statusCode === 200) {
        logger.info('Self-pinger: Ping successful (200 OK)');
      } else {
        logger.warn(`Self-pinger: Received status code ${res.statusCode}`);
      }
    }).on('error', (err) => {
      logger.error('Self-pinger: Error sending ping:', err.message);
    });
  }, 14 * 60 * 1000); 
};
