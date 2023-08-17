
export default class Light {
    id: number;
    pwm: boolean;
    gpio: number;
    currentValue: number;
    name: string;

    constructor(id: number, pwm: boolean, gpio: number, currentValue: number, name: string) {
        this.id = id;
        this.pwm = pwm;
        this.gpio = gpio;
        this.currentValue = currentValue;
        this.name = name;
    }
};