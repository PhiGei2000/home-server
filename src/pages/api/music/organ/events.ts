import * as mysql from 'mysql';
import { NextApiRequest, NextApiResponse } from 'next';
import { toSqlDate } from '../../../../lib/sqlDateFormat';
import { MediaType } from '../../../../lib/network';

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

    const parsedDate = date ? new Date(Date.parse(date as string)) : undefined;
    res.redirect(307, getRedirectionUrl(parsedDate));
}

function getRedirectionUrl(date: Date | undefined) : string {
    const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}api/music/organ/events`;

    if (date === undefined) {
        const currentYear = new Date(Date.now()).getFullYear();
        return `${baseUrl}/${currentYear}`;
    }

    return `${baseUrl}/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}/${date.getHours()}/${date.getMinutes()}/${date.getSeconds()}`;
}

function handlePost(req: NextApiRequest, res: NextApiResponse) {
    const mediaType = MediaType.parse(req.headers['content-type']!);
    if (mediaType.type != 'application/json') {
        // send unsupported media type
        res.status(415);
        return;
    }

    const {date, location, comment, songsPlayed} = req.body;
    if (!date) {
        res.status(415);
        return;
    }

    const connection = connectDatabase();

    const eventDate = new Date(date);
    const dateString = toSqlDate(eventDate);

    // check if date exists
    connection.query(`SELECT Date FROM Events WHERE Date="${dateString}"`, (err, results, fields) => {
        const exists = results.length !== 0;
        if (!exists) {
            // create new entry
            connection.query(`INSERT INTO Events(Date,Location,Comment) VALUES (\"${dateString}\","${location ?? ""}","${comment ?? ""}")`, (err, result, fields) => {
                if (err) {
                    res.status(500).end(err);
                    connection.end();
                    return;
                }

                if (songsPlayed) {
                    updatePlayedSongs(connection, dateString, songsPlayed, () => {
                        const json = JSON.stringify({
                            date: date,
                            location: location ?? "",
                            comment: comment ?? "",
                            songsPlayed: songsPlayed ?? []
                        });

                        res.status(201).end(json);
                        connection.end();
                    })
                }
            });
        }
        else {
            // update existing entry
            let columnsToUpdate: { columnName: string, value: string }[] = [];
            if (location !== undefined)
                columnsToUpdate.push({ columnName: "Location", value: location });

            if (comment !== undefined)
                columnsToUpdate.push({ columnName: "Comment", value: comment });

            if (columnsToUpdate.length !== 0) {
                const setCommand = columnsToUpdate.map((val) => `${val.columnName}="${val.value}"`).join(",");
                const updateCommand = `UPDATE Events SET ${setCommand} WHERE Date="${dateString}"`;

                connection.query(updateCommand, (err, results, fields) => {
                    if (err) {
                        res.status(500).end(err);
                        connection.end();
                        return;
                    }

                    if (songsPlayed) {
                        updatePlayedSongs(connection, dateString, songsPlayed, () => {
                            const json = JSON.stringify({
                                date: date,
                                location: location ?? "",
                                comment: comment ?? "",
                                songsPlayed: songsPlayed ?? []
                            });

                            res.status(200).end(json);
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
                connection.query(`INSERT INTO Played VALUES("${date}","${songID}","${verses}",${index + 1})`, (err, results, fields) => {
                    if (index === songs.length - 1 && callback) {
                        callback();
                    }
                });
            }
        });
    });
}

