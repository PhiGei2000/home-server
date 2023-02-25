import { NextApiRequest, NextApiResponse } from "next";
import { getSensors } from ".";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { sensorId } = req.query;

    const sensors = getSensors();
    if (sensorId) {
        const id = parseInt(sensorId as string);
        sensors.then(sensors => sensors.find(sensor => sensor.id == id))
            .then(sensor => JSON.stringify(sensor))
            .then(json => {
                res.status(200);
                res.setHeader('Content-Type', 'application/json');
                res.write(json)
                res.end();
            });

        return;
    }

    sensors.then(sensors => JSON.stringify(sensors))
        .then(sensors => {
            res.writeHead(200, {
                'Content-Length': Buffer.byteLength(sensors),
                'Content-Type': 'application/json'
            }).end(sensors);
        });
}
