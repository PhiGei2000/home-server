import { NextApiRequest, NextApiResponse } from "next";
import { ClimateMeasure, Sensor } from "../../../lib/climate";
import * as path from 'path';
import * as fs from 'fs/promises';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const now = new Date();

    const begin = req.query.begin
        ? new Date(req.query.begin as string)
        : new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const end = req.query.end
        ? new Date(req.query.end as string)
        : now;

    let sensorIds: number[] = [];
    if (req.query.sensorIds) {
        const queryValue = req.query.sensorIds as string;
        queryValue.split('')
    }

    getClimateDataRange(begin, end, sensorIds)
        .then(data => JSON.stringify(data))
        .then(json => {
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(json)
            }).end(json);
        });
}



export function getSensors(): Promise<Sensor[]> {
    return fs.readFile(path.join(process.env.CLIMATE_DATA_DIRECTORY!, './sensors.json'), { encoding: 'utf-8' })
        .then(json => JSON.parse(json) as Sensor[]);
}

export async function getClimateData(year: number, month: number, sensorIds?: number[], predicate?: (measure: ClimateMeasure) => boolean): Promise<ClimateMeasure[]> {
    if (!sensorIds || sensorIds.length === 0) {
        sensorIds = await getSensors()
            .then(sensors => sensors.map(sensor => sensor.id));
    }

    if (!predicate) {
        predicate = (measure: ClimateMeasure) => true;
    }

    return (
        await Promise.all(sensorIds!
            .map(async sensorId => {
                const filename = path.join(process.env.CLIMATE_DATA_DIRECTORY!, `sensor${sensorId}/${year}_${month}.csv`);

                const csv = await fs.readFile(filename, { encoding: 'utf-8' });
                return ClimateMeasure.fromCSV(csv, sensorId);
            })
        )
    ).reduce((curr, next) => curr.concat(next));
}

export async function getClimateDataRange(begin: Date, end: Date, sensorIds?: number[]): Promise<ClimateMeasure[]> {
    const beginYear = begin.getFullYear();
    const beginMonth = begin.getMonth() + 1;

    const endYear = end.getFullYear();
    const endMonth = end.getMonth() + 1;

    if (!sensorIds || sensorIds.length == 0) {
        sensorIds = await getSensors()
            .then(sensors => sensors.map(sensor => sensor.id));
    }

    // determine which files have to be read
    let data: ClimateMeasure[] = [];
    var month = beginMonth, year = beginYear;
    const predicate = function (measure: ClimateMeasure): boolean {
        return measure.time <= end && measure.time >= begin;
    };

    while (year < endYear || (year == endYear && month <= endMonth)) {
        await Promise.all(sensorIds!.map(async id => {
            const sensorData = await getClimateData(year, month, sensorIds);
            sensorData.forEach(measure => {
                if (predicate(measure)) {
                    data.push(measure);
                }
            })
        }));

        if (++month > 12) {
            month = 1;
            year++;
        }
    }

    return data;
}
