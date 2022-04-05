import { NextApiRequest, NextApiResponse } from 'next';
import { Authentication } from '../../lib/authentication';
import '../../lib/userDatabase'


export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const data = req.body;


    if (!data.username || !data.password) {
      res.status(400).json({ data: 'Username or password not found' });
      return;
    }

    const username = data.username as string;
    const password = data.password as string;

    // check if cookies contain a session id
    if (req.headers.cookie) {
      let cookies: Map<string, string> = new Map<string, string>();
      req.headers.cookie.split(';').forEach(cookie => {
        let parts = cookie.split('=', 2);
        console.log(parts);

        cookies.set(parts[0], parts[1]);
      });

      if (cookies['SID']) {
        if (Authentication.isValid(cookies['SID'])) {
          if (data.return_to) {
            res.setHeader('Location', data.return_to as string);
          }
          else {
            res.setHeader('Location', `http://${req.headers.host}/`);
          }

          res.status(302);
          return;
        }
      }
    }

    // create new session
    const session = Authentication.openSession(username, password);

    if (session) {
      if (data.return_to) {
        res.setHeader('Location', data.return_to as string);
      }
      else {
        res.setHeader('Location', `http://${req.headers.host}/`);
      }

      res.setHeader('Set-Cookie', `SID=${session.sessionId}`);

      res.status(302).end();
    }
    else {
      res.status(400).json({ data: 'Username or password incorrect' });
    }
  }
  else {
    res.status(405);
  }

  res.end();
}
