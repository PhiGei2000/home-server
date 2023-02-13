import { NextApiRequest, NextApiResponse } from "next";
import UserDatabase from "../../lib/userDatabase";

export default async function login(req: NextApiRequest, res: NextApiResponse) {
    if (!req.body){
        res.status(400).end("No content given!");
        return;
    }

    if (req.headers['content-type'] != 'application/json') {
        res.status(415).end();
        return;
    }

    const json = JSON.parse(req.body());
    const username = json.username;
    const password = json.password;

    if (!(username && password)) {
        res.status(400).end("Credentials not complete");
    }

    const user = await UserDatabase.getUser(username, password);
    if (user) {
        res.status(200).end(user);
    }

    res.end(400).end("");
}