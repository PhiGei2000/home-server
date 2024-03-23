import * as mysql from 'mysql';
import { NextApiRequest, NextApiResponse } from 'next';
import { MediaType } from '../../../../lib/network';
import PlayEvent from '../../../../lib/music/event';
import Song, { PlayedSong } from '../../../../lib/music/song';
import { addOrUpdateEvent } from '../../../../lib/music/database';

export default function handle(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case "GET":
        case "HEAD":
            handleGet(req, res);
            break;
        case "POST":
            handlePost(req, res);
            break;            
        default:
            res.end(405);
            break;
    }
}

function handleGet(req: NextApiRequest, res: NextApiResponse) {
    const { date } = req.query;

    const parsedDate = date ? new Date(Date.parse(date as string)) : undefined;
    res.redirect(307, getRedirectionUrl(parsedDate));
}

function getRedirectionUrl(date: Date | undefined): string {
    const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}api/music/organ/events`;

    if (date === undefined) {
        const currentYear = new Date(Date.now()).getFullYear();
        return `${baseUrl}/${currentYear}`;
    }

    return `${baseUrl}/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}/${date.getHours()}/${date.getMinutes()}/${date.getSeconds()}`;
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
    const mediaType = MediaType.parse(req.headers['content-type']!);
    if (mediaType.type != 'application/json') {
        // send unsupported media type
        res.status(415);
        return;
    }

    const { date, location, comment, songsPlayed } = req.body;
    if (!date) {
        res.status(415);
        return;
    }

    const eventDate = new Date(date);

    const event = new PlayEvent(eventDate, location, comment);
    event.songsPlayed = songsPlayed.map((playedSong: any) => new PlayedSong(new Song(playedSong.songID, "", "", ""), playedSong.verses));

    addOrUpdateEvent(event)
        .then(() => res.status(201).end())
        .catch(err => {
            // songID not found
            if (err.errno === 1452) {
                const rex = /SongID\=\'([^\']+)\'/

                const match = rex.exec(err.sql)
                if (match) {
                    res.status(403).end(`Unknown songID ${match[1]}\n${err}`)
                }
            }

            res.status(500).json(err)
        });
}
