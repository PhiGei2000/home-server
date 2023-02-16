import * as crypto from 'crypto';

export async function checkPassword(password: string): Promise<boolean> {
    const passwordHash = crypto.createHash('sha256').update(password).digest('base64');
    return passwordHash == process.env.LOGIN_KEY;
}