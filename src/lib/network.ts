import { NextApiRequest } from "next";

export function getQueryParam<T>(request: NextApiRequest, parameterName: string, defaultValue: T) {
    const value = request.query[parameterName];

    return value ? (value as T) : defaultValue;
}