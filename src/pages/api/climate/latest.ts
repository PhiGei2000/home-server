import { NextApiRequest, NextApiResponse } from "next";
import { getClimateData, getSensors } from ".";
import { ClimateData, ClimateMeasure } from "../../../lib/climate";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.end(405);
        return;
    }

    const now = new Date();
    const sensors = await getSensors();
    const latest: ClimateMeasure[] = await Promise.all(sensors.map(sensor => getLatestMeasure(sensor.id)));

    async function getLatestMeasure(sensorId: number): Promise<ClimateMeasure> {
        const data = await getClimateData(now.getFullYear(), now.getMonth() + 1, [sensorId])

        return data.reduce((latest, current) => latest.time > current.time ? latest : current);
    }

    const json = JSON.stringify(latest);
    res.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(json),
    }).end(json);
}
