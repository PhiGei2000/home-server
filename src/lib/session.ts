import { IncomingMessage, ServerResponse } from "http";

export default class Session {
    public readonly sessionId: string;

    public readonly username: string;
    public readonly created: Date;

    static createSession(req: IncomingMessage, res: ServerResponse): Session {
        if (req.)
    }
}