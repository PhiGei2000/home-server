import 'fs'
import { readFile, readFileSync } from 'fs';
import Logger from './logger';

export type Permission = "root" | "default";

export class User {
    public readonly username: string;

    private readonly password: string;

    public readonly permission: Permission;

    constructor(username: string, password: string, permission: Permission = "default") {
        this.username = username;
        this.password = password;
    }

    public checkPassword(password: string): boolean {
        return password === this.password;
    }
}

export default abstract class UserDatabase {

    public static async getUser(username: string, password: string): Promise<User> {
        const users = await this.getAll();

        const user = users.find(user => user.username === username);
        if (user.checkPassword(password)) {
            return user;
        }

        return null;
    }

    public static getUserSync(username: string): User {
        const users = this.getAllSync();

        return users.find(user => user.username === username);
    }

    private static getAll(): Promise<User[]> {
        return new Promise<Buffer>((resolve, reject) => {
            readFile("data/users.json", (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data)
                }
            })
        }).then(data => {
            var strData = data.toString();

            var object = JSON.parse(strData);
            return object;
        }).then(obj => {
            Logger.log("User data loaded");

            return obj.map(element => new User(element.username, element.password))
        })
            .catch(err => {
                Logger.log(err);
            });
    }

    public static getAllSync(): User[] {
        const data = readFileSync('data/users.json');

        var strData = data.toString();
        var json = JSON.parse(strData);

        return json.map(user => new User(user.username, user.password));
    }
}
