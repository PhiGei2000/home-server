import 'crypto'
import { createHash } from 'crypto';
import { AuthenticationException } from './authentication';
import UserDatabase from './userDatabase';

export default class Session {
    public readonly sessionId: string;

    public readonly username: string;
    public readonly created: Date;

    public validTo: Date;

    constructor(username: string, password: string) {
        if (!this.checkUserPassword(username, password)) {
            throw new AuthenticationException(username, "User not found or false password");
        }

        this.created = new Date(Date.now());
        this.validTo = new Date(this.created.setFullYear(this.created.getFullYear() + 1));

        this.sessionId = createHash("sha256").update(this.username + this.created.toISOString()).digest('hex');
    }

    private checkUserPassword(username: string, password: string): boolean {
        const user = UserDatabase.getUserSync(username);

        console.log(user);
        if (user) {
            return user.checkPassword(password);
        }

        return false;
    }
}