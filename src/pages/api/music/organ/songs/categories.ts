import { NextApiRequest, NextApiResponse } from "next";
import { getCategories } from "../../../../../lib/music/database";
import { toHttpDate } from "../../../../../lib/network";

export default function handle(req: NextApiRequest, res: NextApiResponse) {
    if (req.method != "GET") {
        res.status(405).end();
        return;
    }

    getCategories().then((categories) => {        
        res.status(200)
        res.setHeader("Last-Modified", toHttpDate(categories.lastModified));
        res.json(categories.data);
    });
}