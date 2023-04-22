import * as mysql from 'mysql';
import { NextApiRequest, NextApiResponse } from 'next';
import Event, * as EventData from '../../../../../lib/music/event';
import Song, { PlayedSong } from '../../../../../lib/music/song';
import { toSqlDate } from '../../../../../lib/sqlDateFormat';

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

    const predicate = getDatePrecdicate(date)

    const connection = connectDatabase();
    connection.query(`SELECT * FROM Events ${predicate}`, function (err, results, fields) {
        if (err) {
            res.status(500).end(err);

            connection.end()
            return;
        }

        if (results.length === 0) {
            res.status(404).end();

            connection.end();
            return;
        }

        const events: Event[] = results.map((result: any) => new EventData.default(result.Date, result.Location, result.Comment));
        connection.end();

        const connectionPool = mysql.createPool({
            ...connectionConfig,
            connectionLimit: results.length
        });


        var eventsHandled = 0;
        events.forEach((event) => {
            const dateStr = toSqlDate(event.date);
            connectionPool.query(`SELECT Songs.SongID, Songs.Title, Songs.Category, Songs.Section, Event.Verses FROM (SELECT * FROM Played WHERE Date="${dateStr}") as Event INNER JOIN Songs ON Songs.SongID=Event.SongID ORDER BY Position`)
                .on('error', (err) => {
                    res.status(500).end(err);

                    connectionPool.end()
                }).on('result', (res) => {
                    const song = new Song(res.SongID, res.Title, res.Category, res.Section);
                    event.songsPlayed.push(new PlayedSong(song, res.Verses));
                }).on('end', () => {
                    eventsHandled++;

                    if (eventsHandled == results.length) {
                        res.status(200).json(events);

                        connectionPool.end();
                    }
                })
        });
    });
}

function getDatePrecdicate(date: string[] | undefined): string {
    if (date == undefined) {
        return "";
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
        return `WHERE DATE="${toSqlDate(begin)}"`;
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

    return `WHERE DATE BETWEEN "${toSqlDate(begin)}" AND "${toSqlDate(end)}"`;
}