import { NextApiRequest, NextApiResponse } from 'next';
import { addSong, getSong, getSongs } from '../../../../lib/music/database';
import { MediaType } from '../../../../lib/network';
import Song from '../../../../lib/music/song';

export default function handle(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case "GET":
            handleGet(req, res);
            break;
        case "POST":
            handlePost(req, res);
            break;
    }
}

function handleGet(req: NextApiRequest, res: NextApiResponse) {
    const { songID } = req.query;

    if (!songID) {
        getSongs()
            .then((songs) => {
                res.status(200).json(songs);
            })
    }
    else {
        getSong(songID as string)
            .then((song) => {
                if (song) {
                    res.status(200).json(song);
                }
                else {
                    res.status(404).end();
                }
            })
            .catch((err) => res.status(500).end(err));
    }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
    if (!req.headers["content-type"]) {
        res.status(415).end();
        return;
    }

    const contentType = MediaType.parse(req.headers["content-type"]!);
    if (contentType.type !== "application/json") {
        res.status(415).end();
        return;
    }

    const { songID, title, category, section, verses, melody } = req.body;
    const song = new Song(songID, title, category, section, verses, melody);

    addSong(song)
        .then((success) => {
            res.status(success ? 201 : 500);

            if (success) {
                res.json(song);
            }

            res.end();
        })
        .catch((err) => { res.status(500).end(err); });
}
