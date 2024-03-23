import { NextApiRequest, NextApiResponse } from 'next';
import { DatabaseResponse, addSong, execSql, getSong, getSongs, getSongsByCategory, getSongsBySection, getSongsByTitle } from '../../../../lib/music/database';
import { MediaType, toHttpDate } from '../../../../lib/network';
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
    const { songID, title, category, section } = req.query;

    function sendSongs(songs: DatabaseResponse<Song | Song[]>) {
        if (songs.data) {
            res.status(200).setHeader("Last-Modified", toHttpDate(songs.lastModified)).json(songs.data);
        }
        else {
            res.status(404).end();
        }
    }

    if (songID) {
        getSong(songID as string)
            .then((song) => {
                sendSongs(song);
            })
            .catch((err) => res.status(500).end(err));
    }
    else if (title) {
        getSongsByTitle(title as string)
            .then(sendSongs);
    }
    else if (category) {
        getSongsByCategory(category as string)
            .then(sendSongs);
    }
    else if (section) {
        getSongsBySection(section as string)
            .then(sendSongs);
    }
    else {
        getSongs().then(sendSongs)
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
                res.setHeader("Last-Modified", toHttpDate(new Date(Date.now()))).json(song);
            }

            res.end();
        })
        .catch((err) => { res.status(500).end(err); });
}
