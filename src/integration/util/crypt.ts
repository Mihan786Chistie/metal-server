import * as crypto from 'crypto';

const ALGO = 'aes-256-ctr';

export function encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGO, Buffer.from(process.env.ENCRYPTION_KEY!, 'base64'), iv);

    const encrypted = Buffer.concat([
        cipher.update(text),
        cipher.final(),
    ]);

    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(hash: string): string {
    const [ivHex, contentHex] = hash.split(':');

    const iv = Buffer.from(ivHex, 'hex');
    const content = Buffer.from(contentHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGO, Buffer.from(process.env.ENCRYPTION_KEY!, 'base64'), iv);

    const decrypted = Buffer.concat([
        decipher.update(content),
        decipher.final(),
    ]);

    return decrypted.toString();
}