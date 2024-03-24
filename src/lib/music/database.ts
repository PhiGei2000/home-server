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

export class DatabaseResponse<T> {
    data: T | undefined;
    lastModified: Date;

    constructor(data?: T, lastModified?: Date) {
        this.data = data;
        this.lastModified = lastModified ?? new Date(Date.now());
    }
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

function _getUpdateTimes(connection: mysql.Connection, tableName?: string): Promise<{ tableName: string, updateTime: Date }[] | undefined> {
    return new Promise((resolve, reject) => {
        var responseHandler = (err, result, fields) => {
            if (err) {
                reject(err);
            }
            else {
                var data = result.map((value: any) => { return { tableName: value.TABLE_NAME, updateTime: Date.parse(value.UPDATE_TIME ?? value.CREATE_TIME) } });
                resolve(data);
            }
        };

        if (tableName) {
            connection.query("SELECT TABLE_NAME,UPDATE_TIME,CREATE_TIME FROM information_schema.tables WHERE TABLE_SCHEMA = 'organ' AND TABLE_NAME = ?", [tableName], responseHandler);
        }
        else {
            connection.query("SELECT TABLE_NAME,UPDATE_TIME,CREATE_TIME FROM information_schema.tables WHERE TABLE_SCHEMA = 'organ'", responseHandler);
        }
    });
}

export async function getSong(songID: string): Promise<DatabaseResponse<Song>> {
    const connection = connectDatabase();
    var song = await _getSong(songID, connection);
    var updateTime = await _getUpdateTimes(connection, "Songs");
    connection.end();

    return new DatabaseResponse(song, updateTime?.at(0)?.updateTime);
}

export async function getSongs(): Promise<DatabaseResponse<Song[]>> {
    const connection = connectDatabase();
    var songs = await _getSongs(connection);
    var updateTime = await _getUpdateTimes(connection, "Songs");
    connection.end();

    return new DatabaseResponse(songs, updateTime?.at(0)?.updateTime);
}

export async function getSongsByTitle(title: string): Promise<DatabaseResponse<Song[]>> {
    const connection = connectDatabase();
    const titleWildcard = `\%${title}\%`;

    var songs = await new Promise<Song[]>((resolve, reject) => connection.query("SELECT * FROM Songs WHERE Title LIKE ?", [titleWildcard], (error, values, fields) => {
        if (error) {
            reject(error);
            return;
        }

        resolve(values.map((value: any) => new Song(value.SongID, value.Title, value.Category, value.Section, value.Verses, value.Melody)));
    }));

    var updateTime = await _getUpdateTimes(connection, "Songs");
    connection.end();

    return new DatabaseResponse(songs, updateTime?.at(0)?.updateTime);
}

export async function getSongsByCategory(category: string): Promise<DatabaseResponse<Song[]>> {
    const connection = connectDatabase();

    var songs = await _getSongsByCategory(category, connection);
    var updateTime = await _getUpdateTimes(connection, "Songs");
    connection.end();

    return new DatabaseResponse(songs, updateTime?.at(0)?.updateTime);
}

export async function getSongsBySection(section: string): Promise<DatabaseResponse<Song[]>> {
    const connection = connectDatabase();
    var songs = await _getSongsBySection(section, connection)

    var updateTime = await _getUpdateTimes(connection, "Songs");
    connection.end();

    return new DatabaseResponse(songs, updateTime?.at(0)?.updateTime);
}

export function addSong(song: Song): Promise<DatabaseResponse<boolean>> {
    const connection = connectDatabase();
    return _addSong(song, connection)
        .then((success) => {
            connection.end();
            return new DatabaseResponse(success);
        }).catch((err) => {
            connection.end();
            return new DatabaseResponse(false);
        });
}

export async function getEvents(begin: Date, end?: Date): Promise<DatabaseResponse<PlayEvent[]>> {
    const connection = connectDatabase();
    var data
    if (!end) {
        data = await _getEvent(begin, connection)
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
                return undefined;
            });

        var updateTimes = await _getUpdateTimes(connection);
        connection.end();
        var updateTime = new Date(0);

        if (updateTimes) {
            updateTimes.forEach((entry) => {
                if (entry.tableName == "Events" || entry.tableName == "Played") {
                    if (updateTime < entry.updateTime) { updateTime = entry.updateTime; }
                }
            })
        }

        return new DatabaseResponse(data, updateTime);
    }

    data = await _getEvents(begin, end, connection)
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
            console.log(err);
            return undefined;
        });

    var updateTimes = await _getUpdateTimes(connection);
    connection.end();
    var updateTime = new Date(0);

    if (updateTimes) {
        updateTimes.forEach((entry) => {
            if (entry.tableName == "Events" || entry.tableName == "Played") {
                if (updateTime < entry.updateTime) { updateTime = entry.updateTime; }
            }
        })
    }

    return new DatabaseResponse(data, updateTime);
}

export async function getPlayedSongs(date: Date): Promise<DatabaseResponse<PlayedSong[]>> {
    const connection = connectDatabase();
    var songs = await _getPlayedSongs(date, connection)
        .catch((err) => undefined);

    var updateTime = await _getUpdateTimes(connection, "Played");
    connection.end();

    return new DatabaseResponse(songs, updateTime?.at(0)?.updateTime);
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

export async function getSections(): Promise<DatabaseResponse<string[]>> {
    const connection = connectDatabase();

    const sections = await _getSections(connection);
    const updateTime = (await _getUpdateTimes(connection, "Songs"))?.at(0)?.updateTime;
    connection.end();

    return new DatabaseResponse(sections, updateTime);
}

export async function getCategories(): Promise<DatabaseResponse<string[]>> {
    const connection = connectDatabase();

    const categories = await _getCategories(connection);
    const updateTime = (await _getUpdateTimes(connection, "Songs"))?.at(0)?.updateTime;
    connection.end();

    return new DatabaseResponse(categories, updateTime);
}

export async function getSectionsAndCategories(): Promise<DatabaseResponse<{ sections: string[], categories: string[] }>> {
    const connection = connectDatabase();

    var sections, categories, updateTime;
    try {
        sections = await _getSections(connection);
        categories = await _getCategories(connection);
        updateTime = (await _getUpdateTimes(connection))?.at(0)?.updateTime;
    }
    catch (e) {
        return new DatabaseResponse<{sections: string[], categories: string[]}>(undefined);
    }
    finally {
        connection.end();
    }

    return new DatabaseResponse({ sections: sections, categories: categories }, updateTime);
}

export async function getTableUpdateTimes(): Promise<{ tableName: string, updateTime: Date }[] | undefined> {
    const connection = connectDatabase();

    var data = await _getUpdateTimes(connection);
    connection.end();

    return data;
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
