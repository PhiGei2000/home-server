import * as mysql from 'mysql';
import { NextApiRequest, NextApiResponse } from 'next';
import Song from '../../../../lib/music/song';

function connectDatabase() {
    return mysql.createConnection({
        host: process.env.ORGAN_DATABASE_HOST,
        user: process.env.ORGAN_DATABASE_USER,
        password: process.env.ORGAN_DATABASE_PASSWORD,
        database: 'organ'
    });
}

export default function handle(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case "GET":
            handleGet(req, res);
            break;
    }
}

function handleGet(req: NextApiRequest, res: NextApiResponse) {
    const { songID } = req.query;

    const connection = connectDatabase();
    connection.query(`SELECT * FROM Songs WHERE SongID="${songID}";`, function (err, result, fields) {
        if (err) {
            res.status(500).end(err);

            connection.end();
            return;
        }

        if (result.length == 0) {
            res.status(404).end();

            connection.end();
            return;
        }

        const song = new Song(result[0].SongID, result[0].Title, result[0].Category, result[0].Section);

        res.status(200).json(song);

        connection.end();
    });
}
