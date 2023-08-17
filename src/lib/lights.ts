import * as mysql from 'mysql';
import { exec } from 'child_process';
import Light from './light';

function connectDatabase(): mysql.Connection {
    return mysql.createConnection({
        host: process.env.SMARTHOME_DATABASE_HOST,
        user: process.env.SMARTHOME_DATABASE_USER,
        password: process.env.SMARTHOME_DATABASE_PASSWORD,
        database: 'Smarthome'
    });
}

export function getLight(id: string | undefined, connection?: mysql.Connection): Promise<Light | undefined> | Promise<Light[]> {
    var closeConnection = false;
    if (connection == undefined) {
        connection = connectDatabase();
        closeConnection = true;
    }

    if (id) {
        return new Promise<Light | undefined>((resolve, reject) => {
            connection!.query(`SELECT * FROM Lights WHERE ID = ?`, [id], (err, res, fields) => {
                if (err) {
                    reject(err);
                    if (closeConnection)
                        connection!.end();
                    return;
                }

                if (res.length === 0) {
                    resolve(undefined);
                    if (closeConnection)
                        connection!.end();
                    return
                }

                resolve(new Light(res[0].ID, res[0].PWM, res[0].gpio, res[0].currentValue, res[0].name));
                if (closeConnection)
                    connection!.end();
            });
        });
    }

    return new Promise<Light[]>((resolve, reject) => {
        connection!.query('SELECT * FROM Lights', (err, res, fields) => {
            if (err) {
                reject(err);
                if (closeConnection)
                    connection!.end();
                return;
            }

            var lights = res.map((result: any) => new Light
                (result.ID, result.PWM, result.gpio, result.currentValue, result.name));
            resolve(lights);

            if (closeConnection)
                connection!.end();
        })
    })
}

export async function setLightValue(id: string, value: number): Promise<Light | undefined> {
    const connection = connectDatabase();
    const light = await getLight(id, connection) as Light;

    if (!light) {
        return undefined;
    }

    return new Promise<Light>((resolve, reject) => {
        exec(`gpio ${light.pwm ? 'pwm' : 'write'} ${light.gpio} ${value}`, (err, stdout, stderr) => {
            if (err) {
                reject(err);
                connection.end();
                return;
            }

            connection.query('UPDATE Lights SET currentValue= ? WHERE ID= ? ', [value, id], async (error, results, fields) => {
                if (err) {
                    reject(err);
                    connection.end();
                    return;
                }

                resolve(await getLight(id, connection) as Light);
                connection.end();
            })
        });
    });
}
