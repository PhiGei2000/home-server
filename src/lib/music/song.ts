import { escape as mysqlEscape } from "mysql";

export default class Song {
    public songID: string;
    public title: string;
    public category: string;
    public section: string;
    public verses?: number;
    public melody?: string;

    constructor(songID: string, title: string, category: string, section: string, verses?: number, melody?: string) {
        this.songID = songID;
        this.title = title;
        this.category = category;
        this.section = section;
        this.verses = verses;
        this.melody = melody;
    }

    public toSqlString(): string {
        return mysqlEscape({
            SongID: this.songID,
            Title: this.title,
            Category: this.category,
            Section: this.section,
            Verses: this.verses,
            Melody: this.melody
        });
    }
}

export class PlayedSong {
    public song: Song;
    public verses: string;

    constructor(song: Song, verses?: string) {
        this.song = song;
        this.verses = verses ? PlayedSong.parseVerses(verses!) : "";
    }

    static formatVerses(verses: string): string {
        const numbers = verses.split(',').map((val) => Number.parseInt(val));

        let result = numbers[0].toString();
        let range = false;
        for (var i = 1; i < numbers.length; i++) {
            if (numbers[i - 1] == numbers[i] - 1) {
                range = true;
            }
            else {
                if (range) {
                    range = false;
                    result += "-" + numbers[i].toString();
                }
                else {
                    result += "+" + numbers[i].toString();
                }
            }
        }

        if (range) {
            result += "-" + numbers[numbers.length - 1].toString();
        }

        return result;
    }

    static parseVerses(verses: string): string {
        const pattern = /^\d+((\+|-)\d+)+$/;
        const databasePattern = /^\d+(\,\d+)*$/

        if (databasePattern.test(verses)) {
            return verses;
        }

        if (!pattern.test(verses)) {
            throw Error("Invalid format");
        }

        var parts = verses.split('+')

        const converted = parts.map((part) => {
            if (!part.includes('-'))
                return part;

            const [beginStr, endStr] = part.split('-', 2);
            const [begin, end] = [Number.parseInt(beginStr), Number.parseInt(endStr)];

            var result : string[] = []; 
            for (var i = begin; i <= end; i++) {
                result.push(i.toString());
            }

            return result.join(',');
        });

        return converted.join(',');
    }

    public toSqlString(): string {
        return mysqlEscape({
            song: this.song,
            verses: PlayedSong.formatVerses(this.verses)
        });
    }
}
