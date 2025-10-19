import CryptoJS from 'crypto-js';

export function encryptNote(content: string, password: string): string {
  return CryptoJS.AES.encrypt(content, password).toString();
}

export function decryptNote(encryptedContent: string, password: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedContent, password);
  return bytes.toString(CryptoJS.enc.Utf8);
}

export function generateNoteId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
