/**
 * Database utility functions
 */

import { prisma } from './client';

export async function disconnectDatabase() {
  await prisma.$disconnect();
}

export async function connectDatabase() {
  await prisma.$connect();
}

export async function healthCheck() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    return false;
  }
}
