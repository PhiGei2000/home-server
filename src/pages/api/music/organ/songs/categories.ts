import { NextApiRequest, NextApiResponse } from "next";
import { getCategories } from "../../../../../lib/music/database";

export default function handle(req: NextApiRequest, res: NextApiResponse) {
    if (req.method != "GET") {
        res.status(405).end();
        return;
    }

    getCategories().then((categories) => {
        res.status(200).json(categories);
    });
}