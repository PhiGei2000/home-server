export default class Logger {
    public static log(message: string) {
        const timestamp = new Date().toISOString();

        console.log(`${timestamp}:\t${message}`);
    }

}