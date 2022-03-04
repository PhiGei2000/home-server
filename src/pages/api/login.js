import '../../lib/userDatabase'
import UserDatabase from '../../lib/userDatabase';

export default function handler(req, res) {
  if (req.method === "Post") {
    const { username, password } = req.body;

    const user = UserDatabase.getUser(username);

    if (user.password === password) {
      res.
    }
  }
}
