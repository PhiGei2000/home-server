import { NextApiRequest } from "next";

export function getQueryParam<T>(request: NextApiRequest, parameterName: string, defaultValue: T) {
    const value = request.query[parameterName];

    return value ? (value as T) : defaultValue;
}

export class MediaType {
    public type: String;
    public parameters: Map<String, String>;

    constructor(type: String, parameters?: Map<String, String> | undefined) {
        this.type = type;
        this.parameters = parameters ?? new Map<String, String>();
    }

    static parse(value: String): MediaType {
        const parts = value.split(';');

        const type = parts[0];
        if (parts.length == 1) {
            return new MediaType(type);
        }

        const parameters = new Map<String, String>(parts.slice(1).map((val) => {
            const [name, value] = val.split('=');
            return [name, value];
        }));

        return new MediaType(type, parameters);
    }
}

export function toHttpDate(date : Date): string {
    const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    return `${weekdays[date.getUTCDay()]}, ${date.getUTCDate().toString().padStart(2, "0")} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()} ${date.getUTCHours().toString().padStart(2, "0")}:${date.getUTCMinutes().toString().padStart(2, "0")}:${date.getUTCSeconds().toString().padStart(2, "0")} GMT`
}