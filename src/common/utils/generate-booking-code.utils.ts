import { randomUUID } from 'crypto';

export function generateBookingCode(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = randomUUID().slice(0, 8).toUpperCase();
  return `BK-${date}-${random}`;
}
