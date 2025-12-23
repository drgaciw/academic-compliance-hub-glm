/**
 * @aah/service-monitoring
 * Performance monitoring microservice
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { successResponse } from '@aah/api-utils';

const app = new Hono();

// Middleware
app.use('*', cors());

// Health check
app.get('/health', (c) => {
  return c.json(successResponse({ status: 'ok', service: 'monitoring' }));
});

// Get system metrics
app.get('/metrics', (c) => {
  // TODO: Implement metrics collection
  return c.json(successResponse({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    timestamp: new Date().toISOString(),
  }));
});

// Get performance logs
app.get('/logs', (c) => {
  const limit = parseInt(c.req.query('limit') || '100');
  // TODO: Implement log retrieval
  return c.json(successResponse({
    logs: [],
    limit,
    total: 0,
  }));
});

export default app;
