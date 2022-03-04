let users = require('data/users.json')

export default class UserDatabase {
    getUser(username) {
        return users.find(user => user.name.toString === username);
    }

    getAll() {
        return users;
    }
}
