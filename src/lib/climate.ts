export class ClimateMeasure {
    public time: Date;
    public temperature: number;
    public sensorId: number;

    constructor(time: Date, temperature: number, sensorId: number | undefined) {
        this.time = time;
        this.temperature = temperature;

        this.sensorId = sensorId ?? -1;
    }

    static fromCSV(csv: string, sensorId: number): ClimateMeasure[] {
        const lines = csv.split('\r\n');
        return lines.slice(1, lines.length - 1).map(line => {
            const parts = line.split(',');

            return new ClimateMeasure(new Date(parts[0]), parseFloat(parts[1]), sensorId);
        });
    }
}

export class Sensor {
    public id: number;
    public name: string;
    public ip: string;

    constructor(id: number, name: string, ip: string) {
        this.id = id;
        this.name = name;
        this.ip = ip;
    }
}

export type ClimateData = {
    [sensorId: number]: ClimateMeasure[];
    sensors: Sensor[];
};

