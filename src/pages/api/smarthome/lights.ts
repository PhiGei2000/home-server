import { NextApiRequest, NextApiResponse } from "next";
import "child_process";
import { execSync } from "child_process";
import { getLight, setLightValue } from '../../../lib/lights';


export default function handle(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'POST': {
            const lightID = req.query['id'] as string;
            const value = Number.parseInt(req.query['value'] as string);

            setLightValue(lightID, value).then((light) => {
                if (!light) res.status(404).end();
                else res.status(200).json(light);
            }).catch((err) => {
                res.status(500).json(err);
            });
        }
            break;
        case 'GET': {
            const lightID = req.query['id'] as string;

            getLight(lightID).then(light => {
                if (!light) res.status(404).end();
                else res.status(200).json(light);
            })
        }
            break;
        default:
            res.status(405).end();
            break;
    }
}
