import { describe, it, expect } from 'vitest';

/**
 * Isolated unit tests for Typebot block ID and variable slug sanitization.
 */

function sanitizeVariableSlug(name: string): string {
  if (!name) return '';
  return name.trim().replace(/[^a-zA-Z0-9_]/g, '_');
}

describe('Variable Slug Sanitization', () => {
  it('should preserve valid alphanumeric slug names', () => {
    expect(sanitizeVariableSlug('user_name_123')).toBe('user_name_123');
  });

  it('should replace spaces and punctuation with underscores', () => {
    expect(sanitizeVariableSlug('user email & status!')).toBe('user_email___status_');
  });

  it('should trim surrounding whitespace', () => {
    expect(sanitizeVariableSlug('   session_id   ')).toBe('session_id');
  });

  it('should handle empty or whitespace-only inputs', () => {
    expect(sanitizeVariableSlug('')).toBe('');
    expect(sanitizeVariableSlug('   ')).toBe('');
  });
});
