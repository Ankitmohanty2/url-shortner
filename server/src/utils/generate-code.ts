import { randomBytes } from 'crypto';
import { getEnv } from '../config/env.js';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const ALPHABET_LENGTH = ALPHABET.length;

export function generateShortCode(length?: number): string {
  const codeLength = length ?? getEnv().SHORT_CODE_LENGTH;
  const bytes = randomBytes(codeLength);
  let code = '';

  for (let i = 0; i < codeLength; i++) {
    code += ALPHABET[bytes[i] % ALPHABET_LENGTH];
  }

  return code;
}

export function isValidShortCode(code: string): boolean {
  const { SHORT_CODE_LENGTH } = getEnv();
  const minLength = Math.max(3, SHORT_CODE_LENGTH - 2);
  const maxLength = SHORT_CODE_LENGTH + 2;
  const regex = new RegExp(`^[A-Za-z0-9]{${minLength},${maxLength}}$`);
  return regex.test(code);
}