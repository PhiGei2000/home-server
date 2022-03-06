import { NextApiRequest, NextApiResponse } from 'next';
import { Authentication } from '../../lib/authentication';
import Session from '../../lib/session';
import '../../lib/userDatabase'
import UserDatabase from '../../lib/userDatabase';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "Post") {
    const data = req.body;

    if (!data.username || !data.password) {
      return res.status(400).json({ data: 'Username or password not found' });
    }

    const username = data.username as string;
    const password = data.password as string;

    const session = Authentication.openSession(username, password);

    if (session) {
      if (data.return_to) {
        res.setHeader('Location', data.return_to as string);
      }
      else {
        res.setHeader('Location', `https://${req.headers.host}/`);
      }

      res.setHeader('Set-Cookie', `SID=${session.sessionId}`);

      return res.status(302);
    }

    let cookies;
    req.headers.cookie.split(';').forEach(cookie => {
      let parts = cookie.split('=', 2);

      cookies[parts[0]] = parts[1];
    });

    if (cookies['SID']) {
      if (Authentication.isValid(cookies['SID'])) {
        if (data.return_to) {
          res.setHeader('Location', data.return_to as string);
        }
        else {
          res.setHeader('Location', `https://${req.headers.host}/`);
        }

        return res.status(302);
      }
    }
    

    return res.status(400).json({ data: 'Username or password incorrect' });    
  }

  return res.status(405);
}
