import * as mysql from 'mysql';
import Song, { PlayedSong } from './song';
import { toSqlDate } from '../format';
import PlayEvent from './event';

function connectDatabase() {
    return mysql.createConnection({
        host: process.env.ORGAN_DATABASE_HOST,
        user: process.env.ORGAN_DATABASE_USER,
        password: process.env.ORGAN_DATABASE_PASSWORD,
        database: 'organ'
    });
}

function _getSong(songID: string, connection: mysql.Connection): Promise<Song | undefined> {
    return new Promise<Song | undefined>((resolve, reject) => {
        connection.query(`SELECT * FROM Songs WHERE SongID= ?`, [songID], (error, values, fields) => {
            if (error) {
                reject(error);
                return;
            }

            if (values.length === 0) {
                resolve(undefined);
            }
            else {
                resolve(new Song(values[0].SongID, values[0].Title, values[0].Category, values[0].Section, values[0].Verses, values[0].Melody));
            }
        });
    });
}

function _getSongs(connection: mysql.Connection): Promise<Song[]> {
    return new Promise<Song[]>((resolve, reject) => {
        connection.query('SELECT * FROM Songs', (error, values, fields) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(values.map((value: any) => new Song(value.SongID, value.Title, value.Category, value.Section, value.Verses, value.Melody)));
        });
    });
}

function _getSongsByCategory(category: string, connection: mysql.Connection): Promise<Song[]> {
    return new Promise<Song[]>((resolve, reject) => {
        connection.query("SELECT * FROM Songs WHERE Category = ?", [category], (error, values, fields) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(values.map((value: any) => new Song(value.SongID, value.Title, value.Category, value.Section, value.Verses, value.Melody)));
        })
    })
}

function _getSongsBySection(section: string, connection: mysql.Connection): Promise<Song[]> {
    return new Promise<Song[]>((resolve, reject) => {
        connection.query("SELECT * FROM Songs WHERE Section = ?", [section], (error, values, fields) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(values.map((value: any) => new Song(value.SongID, value.Title, value.Category, value.Section, value.Verses, value.Melody)));
        })
    })
}

function _getPlayedSongs(date: Date, connection: mysql.Connection): Promise<PlayedSong[] | undefined> {
    return new Promise<PlayedSong[] | undefined>((resolve, reject) => {
        connection.query('SELECT Songs.SongID,Played.Verses,Position,Title,Section,Category,Melody FROM Played INNER JOIN Songs ON Songs.SongID=Played.SongID WHERE Date=?', [toSqlDate(date)], (err, values, fields) => {
            if (err) {
                reject(err);
                return;
            }

            if (values.length === 0) {
                resolve(undefined);
            }

            const songs = values.map((value: any) => new PlayedSong(new Song(value.SongID, value.Title, value.Category, value.Section), value.Verses === 'undefined' ? undefined : value.Verses));
            resolve(songs);
        });
    });
}

function _getEvent(date: Date, connection: mysql.Connection): Promise<PlayEvent | undefined> {
    const dateString = toSqlDate(date);
    return new Promise<PlayEvent | undefined>((resolve, reject) => {
        connection.query('SELECT * FROM Events WHERE Date=?', [dateString], (err, results, fields) => {
            if (err) {
                reject(err);
                return;
            }

            if (results.length === 0) {
                resolve(undefined);
            }
            else {
                resolve(new PlayEvent(results[0].date, results[0].location, results[0].comment));
            }
        });
    });
}

function _getEvents(begin: Date, end: Date, connection: mysql.Connection): Promise<PlayEvent[] | undefined> {
    const params = [toSqlDate(begin), toSqlDate(end)];

    return new Promise<PlayEvent[] | undefined>((resolve, reject) => {
        connection.query('SELECT * FROM Events WHERE Date BETWEEN ? AND ?', params, (err, results, fields) => {
            if (err) {
                reject(err);
                return;
            }

            if (results.length > 0) {
                const events = results.map((res: any) => new PlayEvent(res.Date, res.Location, res.Comment));
                resolve(events);
            }
            else {
                resolve(undefined);
            }
        });
    });
}

async function _addSong(song: Song, connection: mysql.Connection): Promise<boolean> {
    const songExists = (await _getSong(song.songID, connection) !== undefined);
    if (songExists) {
        return _updateSong(song, connection);
    }

    const queryString = mysql.escape(song);
    return new Promise<boolean>((resolve, reject) => {
        connection.query('INSERT INTO Songs SET ?', song, (err, results, fields) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(true);
        });
    });
}

function _updateSong(song: Song, connection: mysql.Connection): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        connection.query('UPDATE Songs SET ? WHERE SongID = ?', [song, song.songID], (err, results, fields) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(true);
        });
    });
}

function _addPlayedSong(playedSong: PlayedSong, date: Date, position: number, connection: mysql.Connection): Promise<boolean> {
    const values = [toSqlDate(date), playedSong.song.songID, playedSong.verses, position];
    return new Promise<boolean>((resolve, reject) => {
        connection.query('INSERT INTO Played SET Date=?,SongID=?,Verses=?,Position=?', values, (err, results, fields) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(true);
        });
    });
}

function _addEvent(event: PlayEvent, connection: mysql.Connection): Promise<boolean> {
    const values = [event.date, event.location, event.comment];
    return new Promise<boolean>((resolve, reject) => {
        connection.query('INSERT INTO Events SET Date=?, Location=?, Comment=?', [event.date, event.location ?? "", event.comment ?? ""], (err, results, fields) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(true);
        });
    })
}

function _updateEvent(event: PlayEvent, connection: mysql.Connection): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        connection.query('UPDATE Events SET Location=?,Comment=? WHERE Date=?', [event.location ?? "", event.comment ?? "", event.date], (err, results, fields) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(true);
        });
    });
}

function _deletePlayedSongs(date: Date, connection: mysql.Connection): Promise<number> {
    return new Promise<number>((resolve, reject) => {
        connection.query("DELETE FROM Played WHERE Date=?", [date], (err, results, fields) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(results.changedRows);
        });
    })
}

function _getSections(connection: mysql.Connection): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
        connection.query("SELECT DISTINCT Section FROM Songs", (error, results, fields) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(results.map((res: any) => res.Section));
        })
    });
}

function _getCategories(connection: mysql.Connection): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => connection.query("SELECT DISTINCT Category FROM Songs", (err, results, fields) => {
        if (err) {
            reject(err);
            return;
        }

        resolve(results.map((res: any) => res.Category));
    })
    )
}

export async function getSong(songID: string): Promise<Song | undefined> {
    const connection = connectDatabase();
    return _getSong(songID, connection)
        .then((song) => {
            connection.end();
            return song;
        });
}

export async function getSongs(): Promise<Song[]> {
    const connection = connectDatabase();
    return _getSongs(connection).then((songs) => {
        connection.end();
        return songs;
    })
}

export async function getSongsByTitle(title: string): Promise<Song[]> {
    const connection = connectDatabase();
    const titleWildcard = `\%${title}\%`;

    return new Promise<Song[]>((resolve, reject) => connection.query("SELECT * FROM Songs WHERE Title LIKE ?", [titleWildcard], (error, values, fields) => {
        if (error) {
            reject(error);
            return;
        }

        resolve(values.map((value: any) => new Song(value.SongID, value.Title, value.Category, value.Section, value.Verses, value.Melody)));
    })).then((songs) => {
        connection.end();
        return songs;
    });
}

export async function getSongsByCategory(category: string): Promise<Song[]> {
    const connection = connectDatabase();

    return _getSongsByCategory(category, connection).then((songs) => {
        connection.end();
        return songs;
    })
}

export async function getSongsBySection(section: string): Promise<Song[]> {
    const connection = connectDatabase();
    return _getSongsBySection(section, connection).then((songs) => {
        connection.end();
        return songs;
    })
}

export function addSong(song: Song): Promise<boolean> {
    const connection = connectDatabase();
    return _addSong(song, connection)
        .then((success) => {
            connection.end();
            return success;
        }).catch((err) => {
            connection.end();
            return false;
        });
}

export function getEvents(begin: Date, end?: Date): Promise<PlayEvent[] | undefined> {
    const connection = connectDatabase();
    if (!end) {
        return _getEvent(begin, connection)
            .then(async (event) => {
                if (!event) {
                    return undefined;
                }

                return await _getPlayedSongs(event.date, connection)
                    .then(songs => {
                        event.songsPlayed = songs!;
                        return [event];
                    });
            }).catch((err) => {
                connection.end();
                return undefined;
            });
    }

    return _getEvents(begin, end, connection)
        .then(async (events) => {
            if (!events) {
                return undefined;
            }

            await Promise.all(events.map(async (event) => {
                await _getPlayedSongs(event.date, connection)
                    .then(songs => {
                        event.songsPlayed = songs!;
                    });
            }));

            return events;
        }).catch((err) => {
            connection.end();
            return undefined;
        });
}

export function getPlayedSongs(date: Date): Promise<PlayedSong[] | undefined> {
    const connection = connectDatabase();
    return _getPlayedSongs(date, connection)
        .then((songs) => {
            connection.end();
            return songs;
        }).catch((err) => {
            connection.end();
            return undefined;
        });
}

export async function addOrUpdateEvent(event: PlayEvent): Promise<void> {
    const connection = connectDatabase();

    const exists = (await _getEvent(event.date, connection)) !== undefined;

    var success;
    if (exists) {
        success = await _updateEvent(event, connection);

        if (event.songsPlayed.length > 0)
            await _deletePlayedSongs(event.date, connection);
    }
    else {
        success = await _addEvent(event, connection);
    }

    var i = 0;
    while (success && i < event.songsPlayed.length) {
        success = await _addPlayedSong(event.songsPlayed[i], event.date, i + 1, connection);
        i++;
    }

    connection.end();
}

export async function getSections(): Promise<string[]> {
    const connection = connectDatabase();

    return _getSections(connection).then((sections) => {
        connection.end();
        return sections;
    });
}

export async function getCategories(): Promise<string[]> {
    const connection = connectDatabase();

    return _getCategories(connection).then((categories) => {
        connection.end();
        return categories;
    })
}

export async function getSectionsAndCategories(): Promise<{ sections: string[], categories: string[] } | undefined> {
    const connection = connectDatabase();

    var sections, categories;
    try {
        sections = await _getSections(connection);
        categories = await _getCategories(connection);
    }
    catch (e) {
        return undefined;
    }
    finally {
        connection.end();
    }

    return { sections: sections, categories: categories };
}

export async function execSql(sql: string): Promise<any> {
    const connection = connectDatabase();

    return new Promise((resolve, reject) => {
        connection.query(sql, (err, result, fields) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }

            connection.end();
        })
    });
}
