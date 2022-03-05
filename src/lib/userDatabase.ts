import 'fs'
import { readFile } from 'fs';

export class User {
    public readonly username: string;

    private readonly password: string;

    constructor(username: string, password: string) {
        this.username = username;
        this.password = password;
    }

    checkPassword(password: string): boolean {
        return password === this.password;
    }
}

var users: User[];

export default abstract class UserDatabase {
    public static getUser(username): User {
        return users.find(user => user.username.toString === username);
    }

    public static getAll(): User[] {
        return users;
    }

    public static loadUsers(): Promise<void> {
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
            users=obj.map(element => new User(element.username, element.password))
        });
    }
}
