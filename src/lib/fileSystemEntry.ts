import path from "path";

export enum FileSystemEntryType {
    FILE, DIRECTORY
};

export class FileSystemEntry {
    filename: string;
    type: FileSystemEntryType;

    constructor(filename: string) {
        this.filename = filename;

        this.type = path.extname(filename) === '' ? FileSystemEntryType.DIRECTORY : FileSystemEntryType.FILE;
    }
}
