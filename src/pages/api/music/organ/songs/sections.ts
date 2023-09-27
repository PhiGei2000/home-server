import { NextApiRequest, NextApiResponse } from "next";
import { getSections } from "../../../../../lib/music/database";

export default function handle(req: NextApiRequest, res: NextApiResponse) {
    if (req.method != "GET") {
        res.status(405).end();
        return;
    }

    getSections().then((sections) => {
        res.status(200).json(sections);
    });
}