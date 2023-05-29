import { PlayedSong } from "./song";

export default class PlayEvent {
    public date: Date;
    public location?: string;
    public comment?: string;
    public songsPlayed: PlayedSong[] = [];

    constructor(date: Date, location?: string, comment?: string) {
        this.date = date;
        this.location = location;
        this.comment = comment;
    }
}