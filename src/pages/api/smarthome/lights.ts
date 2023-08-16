import { NextApiRequest, NextApiResponse } from "next";
import "child_process";
import { ChildProcess, spawn } from "child_process";

type Lights = {
    [key: string]: { pwm: boolean, gpio: number }
};

const lights : Lights = {
    0: { pwm: true, gpio: 1 }
};

export default function handle(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'POST':
            const lightID = req.query['id'] as string;
            const value = req.query['value'] as string;

            if (lights[lightID]) {
                if (lights[lightID].pwm) {
                    var process = spawn(`gpio pwm ${lights[lightID].gpio} ${value}`);

                    process.stdout.on('data', (data) => {
                        console.log(data);
                    });
                }
                else {
                    var process = spawn(`gpio write ${lights[lightID].gpio} ${value}`);
                    process.stdout.on('data', (data) => {
                        console.log(data);
                    });
                }

                res.status(200).end();
            }
            else {
                res.status(404).end();
            }
            break;
        default:
            res.status(405).end();
            break;
    }
}