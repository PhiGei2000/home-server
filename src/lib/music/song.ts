export default class Song {
    public songID: string;
    public title: string;
    public category: string;
    public section: string;
    public verses?: number;

    constructor(songID: string, title: string, category: string, section: string, verses?: number) {
        this.songID = songID;
        this.title = title;
        this.category = category;
        this.section = section;
        this.verses = verses;
    }
}

export class PlayedSong {
    public song: Song;
    public verses?: string;

    constructor(song: Song, verses?: string) {
        this.song = song;
        this.verses = verses ? PlayedSong.formatVerses(verses!) : "";
    }

    private static formatVerses(verses: string): string {
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
}