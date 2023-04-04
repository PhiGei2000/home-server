import * as mysql from 'mysql';
import { NextApiRequest, NextApiResponse } from 'next';
import Event, * as EventData from '../../../../lib/music/event';
import Song, { PlayedSong } from '../../../../lib/music/song';

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

    const connection = connectDatabase();
    connection.query(`SELECT * FROM Events WHERE Date=\"${date}\"`, function (err, result, fields) {
        if (err) {
            res.status(500).end(err);

            connection.end()
            return;
        }

        const event = new EventData.default(result[0].Date, result[0].Location, result[0].Comment);

        connection.query(`SELECT Songs.SongID, Songs.Title, Songs.Category, Songs.Section, Event.Verses FROM (SELECT * FROM Played WHERE Date="${date}") as Event INNER JOIN Songs ON Songs.SongID=Event.SongID ORDER BY Position`, function (err, result, fields) {
            if (err) {
                res.status(500).end(err);

                connection.end()
                return;
            }

            result.forEach((row: any) => {
                const song = new Song(row.SongID, row.Title, row.Category, row.Section);
                event.songsPlayed.push(new PlayedSong(song, row.Verses));
            });

            res.status(200).json(event);
            connection.end();
        })
    });
}

function handlePost(req: NextApiRequest, res: NextApiResponse) {
    if (req.headers['content-type'] != "application/json") {
        // send unsupported media type
        res.status(415);
        return;
    }

    const event = req.body;
    if (!event || !event.date) {
        res.status(415);
        return;
    }


    const connection = connectDatabase();

    const eventDate = new Date(event.date);
    const dateString = connection.escape(eventDate);

    // check if date exists
    connection.query(`SELECT Date FROM Events WHERE Date=${dateString}`, (err, results, fields) => {
        const exists = results.length !== 0;
        if (!exists) {
            // create new entry
            connection.query(`INSERT INTO Events(Date,Location,Comment) VALUES (\"${dateString}\","${event.location ?? ""}","${event.comment ?? ""}")`, (err, result, fields) => {
                if (err) {
                    res.status(500).end(err);
                    connection.end();
                    return;
                }

                if (event.songsPlayed) {
                    updatePlayedSongs(connection, dateString, event.songsPlayed, () => {

                        res.status(201).end(event);
                        connection.end();
                    })
                }
            });
        }
        else {
            // update existing entry
            let columnsToUpdate: { columnName: string, value: string }[] = [];
            if (event.location !== undefined)
                columnsToUpdate.push({ columnName: "Location", value: event.location });

            if (event.comment !== undefined)
                columnsToUpdate.push({ columnName: "Comment", value: event.comment });

            if (columnsToUpdate.length !== 0) {
                const setCommand = columnsToUpdate.map((val) => `${val.columnName}="${val.value}"`).join(",");
                const updateCommand = `UPDATE Events SET ${setCommand} WHERE Date=${dateString}`;

                connection.query(updateCommand, (err, results, fields) => {
                    if (err) {
                        res.status(500).end(err);
                        connection.end();
                        return;
                    }

                    if (event.songsPlayed) {
                        updatePlayedSongs(connection, dateString, event.songsPlayed, () => {
                            res.status(200).end();
                            connection.end();
                        })
                    }
                });
            }
        }
    });
}

function updatePlayedSongs(connection: mysql.Connection, date: string, songs: { songID: string, verses: string }[], callback?: () => void) {
    songs.forEach(({ songID, verses }, index) => {
        connection.query(`SELECT * FROM Played WHERE Date="${date}" AND Position=${index + 1}`, (err, results, fields) => {
            const exists = results.length !== 0;
            if (exists) {
                connection.query(`UPDATE Played SET SongID="${songID}", Verses="${verses}" WHERE Date="${date}" AND Position=${index + 1}`, (err, results, fields) => {
                    if (index === songs.length - 1 && callback) {
                        callback();
                    }
                });
            }
            else {
                connection.query(`INSERT INTO Played VALUES(${date},"${songID}","${verses}",${index + 1})`, (err, results, fields) => {
                    if (index === songs.length - 1 && callback) {
                        callback();
                    }
                });
            }
        });
    });
}
