import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import * as fs from 'fs/promises';
import { existsSync } from "fs";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { paths } = req.query;

    let pathStr: string;
    if (paths) {
        pathStr = path.join(process.env.FILE_DIRECTORY!, (paths as string[]).join('/'));
    }
    else {
        pathStr = process.env.FILE_DIRECTORY as string;
    }

    if (req.method === 'GET') {
        if (!existsSync(pathStr)) {
            res.end(404);
            return;
        }

        const isDirectory = path.extname(pathStr) === '';
        if (isDirectory) {
            fs.readdir(pathStr)
                .then(files => {
                    const json = JSON.stringify(files);

                    res.status(200).end(json);
                });

            return;
        }
        else {

        }
    }

    res.end(405);
}