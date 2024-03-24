import * as mysql from 'mysql';
import { NextApiRequest, NextApiResponse } from 'next';
import PlayEvent, * as EventData from '../../../../../lib/music/event';
import Song, { PlayedSong } from '../../../../../lib/music/song';
import { toSqlDate } from '../../../../../lib/format';
import { getEvents } from '../../../../../lib/music/database';
import { toHttpDate } from '../../../../../lib/network';

const connectionConfig = {
    host: process.env.ORGAN_DATABASE_HOST,
    user: process.env.ORGAN_DATABASE_USER,
    password: process.env.ORGAN_DATABASE_PASSWORD,
    database: 'organ'
};

function connectDatabase() {
    return mysql.createConnection(connectionConfig);
}

export default function handle(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case "GET":
        case "HEAD":
            handleGet(req, res);
            break;        
        default:
            res.end(405);
            break;
    }
}

function handleGet(req: NextApiRequest, res: NextApiResponse) {
    var { date } = req.query;

    if (typeof date === "string") {
        date = [date];
    }

    const [begin, end] = getDatePredicate(date);
    getEvents(begin, end)
        .then(events => {
            if (events.data) {
                res.status(200);
                
                const lastModified = toHttpDate(events.lastModified);
                res.setHeader("Last-Modified", lastModified);
                
                if (req.method == "GET") {
                    res.json(events.data);
                }
                res.end();
            }
            else {
                res.status(200);
                res.end();
            }
        });
}

function getDatePredicate(date: string[] | undefined): Date[] {
    if (date == undefined) {
        return [];
    }

    const parseNumber = (str: string, def: number = 0) => str ? Number.parseInt(str) : def;

    const now = new Date(Date.now());
    const year = parseNumber(date[0], now.getFullYear());
    const month = parseNumber(date[1], 1);
    const day = parseNumber(date[2], 1);
    const hour = parseNumber(date[3])
    const minute = parseNumber(date[4]);

    const begin = new Date(year, month - 1, day, hour, minute);
    if (date[4]) {
        return [begin];
    }

    let end;
    if (!date[1]) {
        end = new Date(year + 1, month - 1, day, hour, minute);
    }
    else if (!date[2]) {
        end = new Date(year, month, day, hour, minute);
    }
    else if (!date[3]) {
        end = new Date(year, month - 1, day + 1, hour, minute);
    }
    else {
        end = new Date(year, month - 1, day, hour + 1, minute);
    }

    return [begin, end];
}