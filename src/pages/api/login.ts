import { NextApiRequest, NextApiResponse } from 'next';
import Session from '../../lib/session';
import '../../lib/userDatabase'
import UserDatabase from '../../lib/userDatabase';

var activeSessions: Session[];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "Post") {
    const username = req.headers['username'] as string;
    const password = req.headers['password'] as string;

    const user = UserDatabase.getUser(username);

    if (user.checkPassword(password)) {
      var session = new Session(username);

      activeSessions.push(session);

      res.status(200).end();
    }
    else {
      res.status(400).end();
    }
  }
}

export function sessionValid(sid: string): boolean {
  const session = activeSessions.find(session => session.sessionId === sid);

  if (session) {
    return session.validTo.getTime() < Date.now();
  }

  return false;
}
