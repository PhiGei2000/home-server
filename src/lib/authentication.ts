import Logger from './logger';
import Session from './session'

export class Authentication {
    private static activeSessions: Session[] = [];

    public static isValid(sid: string): boolean {
        const session = this.activeSessions.find(session => session.sessionId === sid);

        if (session) {
            return session.validTo.getTime() < Date.now();
        }

        return false;
    }

    public static openSession(username: string, password: string) {
        try {
            const session = new Session(username, password);

            this.activeSessions.push(session);

            Logger.log(`Session created (ID=${session.sessionId})`)

            return session;
        }
        catch (e) {
            if (e instanceof AuthenticationException) {
                Logger.log(`AuthenticationException: ${e.message}`);
            }
            else {
                console.log(e);
            }
        }
    }

    public static endSession(sid: string) {
        const sessionIndex = this.activeSessions.findIndex(session => session.sessionId === sid);
        if (sessionIndex != -1) {
            this.activeSessions.splice(sessionIndex);

            Logger.log(`Session closed (ID=${sid})`);
        }
    }
}

export class AuthenticationException {
    public readonly username: string;

    public readonly message: string;

    constructor(username: string, message: string) {
        this.username = username;
        this.message = message;
    }
}
