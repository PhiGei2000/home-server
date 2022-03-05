import 'crypto'
import { createHash } from 'crypto';

export default class Session {
    public readonly sessionId: string;

    public readonly username: string;
    public readonly created: Date;

    public validTo: Date;

    constructor(username: string) {
        this.created = new Date(Date.now());
        this.validTo = new Date(this.created.setFullYear(this.created.getFullYear() + 1));

        this.sessionId = createHash("sha256").update(this.username + this.created.toISOString()).digest('hex');        
    }
}