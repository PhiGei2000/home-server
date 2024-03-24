import { NextApiRequest, NextApiResponse } from "next";
import { MediaType } from "../../../../lib/network";
import { execSql } from "../../../../lib/music/database";

export default function handleRequest(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'GET':
            handleGet(req, res);
            break;
        default:
            res.status(405).end();
            break
    }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
    if (!req.headers['content-type']) {
        res.status(400).end();
        return;
    }

    const mediaType = MediaType.parse(req.headers['content-type'])
    if (mediaType.type !== 'application/sql') {
        res.status(415).end();
        return;
    }

    const sql = req.body as string
    if (!checkSql(sql)) {
        res.status(400).end();
        return;
    }

    await execSql(sql)
        .then(result => res.status(200).end(JSON.stringify(result)))
        .catch(err => res.status(400).setHeader("content-type", "text/plain").end(err));
}

function checkSql(sql: String): boolean {
    sql = sql.trim()

    const positions : number[] = []
    for (var i = 0; i < sql.length; i++) {
        if (sql.charAt(i) === ';') positions.push(i);
    }

    return positions.length === 1 && positions[0] === sql.length - 1
}
