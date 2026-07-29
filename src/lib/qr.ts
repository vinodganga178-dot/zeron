import { QRScanResult } from '@/types';

/**
 * Parse a QR code string into a participant record.
 *
 * Supported formats (in priority order):
 * 1. JSON blob: {"id":"ZR-4821","name":"Arun Kumar","department":"CSE"}
 * 2. Pipe-delimited: ZR-4821|Arun Kumar|CSE
 * 3. Plain string: treated as both ID and name
 */
export function parseQRCode(raw: string): QRScanResult {
  const trimmed = raw.trim();

  // 1. Try JSON
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.id && parsed.name) {
        return {
          id: String(parsed.id).trim(),
          name: String(parsed.name).trim(),
          department: String(parsed.department || 'Unknown').trim(),
        };
      }
    } catch {
      // fall through
    }
  }

  // 2. Try pipe-delimited
  if (trimmed.includes('|')) {
    const parts = trimmed.split('|').map((p) => p.trim());
    if (parts.length >= 2) {
      return {
        id: parts[0],
        name: parts[1],
        department: parts[2] || 'Unknown',
      };
    }
  }

  // 3. Plain string — use as both ID and name
  return {
    id: trimmed,
    name: trimmed,
    department: 'Unknown',
  };
}

/**
 * Generate a unique QR-style participant ID for manual entry / simulation.
 */
export function generateParticipantId(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `ZR-P-${num}`;
}
