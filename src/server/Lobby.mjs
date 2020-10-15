function generateLobbyId() {
    const template = "######";
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let id = "";
    for(let letter in template) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    if(lobbies.has(id)) {
        return generateLobbyId();
    }
    return id;
}

const lobbies = new Map();

export default class Lobby {

    static getList() {
        return [...lobbies].map(([id, lobby]) => {
            return lobby.valueOf()
        });
    }

    static get(id) {
        return lobbies.get(id);
    }

    constructor(hostId) {
        this.id = generateLobbyId();
        this.hostId = hostId;
        this.private = true;
        this.created = Date.now();

        lobbies.set(this.id, this);
    }

    destory() {
        lobbies.delete(hostId);
    }

    toJson() {
        return {
            private: this.private,
            hostId: this.hostId,
            created: this.created,
            id: this.id
        }
    }

}
