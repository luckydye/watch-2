import { Room, Message } from '@uncut/hotel';

export default class WatchRoom extends Room {

    broadcast(type, data) {
        this.handler.braodcast(this, new Message(type, data));
    }

    constructor() {
        super();

        this.queue = [];
        this.history = new Set();
        this.userlist = new Map();

        this.state = {
            service: null,
            video: {},
            saved: false,
        }
    }

    getState() {
        return this.state;
    }

    getRoomState() {
        return this.state;
    }

    socketConnected(socket) {
        if (this.userlist.size < 1 && this.queue.length > 0) {
            const vid = this.queue[0];
            this.loadVideo(vid.service, vid.id);
        }

        this.userlist.set(socket.uid, {
            username: socket.username,
            socket: socket,
        });

        if (!this.hostId || this.userlist.size < 1) {
            this.hostId = socket.uid;
        }

        this.resolveHost(socket);
    }

    socketDisconnected(socket) {
        this.userlist.delete(socket.uid);
        this.resolveHost(socket);
    }

    resolveHost(socket) {
        // find another host
        const currentHost = this.userlist.get(this.hostId);
        if (!currentHost) {
            const next = this.userlist.keys().next().value;
            this.hostId = next;

            const host = this.userlist.get(this.hostId);

            if (host) {
                const hostSocket = host.socket;
                console.log("Found new host from " + hostSocket.uid + " to " + next + " for " + this.id);
            }
        }
    }

    syncPlayerState({ timestamp, time, id, service, state }) {
        this.state.video.service = service;
        this.state.video.id = id;
        this.state.video.time = time;
        this.state.video.timestamp = timestamp;
        this.state.video.state = state;
    }

    loadVideo(service, id) {
        this.broadcast('player.state', {
            service: service,
            id: id,
            time: 0,
            state: 1,
        });
        // set video state
        this.syncPlayerState({ service, id, time: 0, timestamp: 0, });
        // add to history
        this.addToHistory({ service, id });
    }

    seekToVideo(time) {
        this.broadcast('seek.video', { time });
    }

    playVideo() {
        this.state.video.state = 0;
    }

    pauseVideo() {
        this.state.video.state = 1;
    }

    addToHistory(video) {
        for (let item of this.history) {
            if (item.id === video.id) return;
        }
        this.history.add(video);
        this.broadcast('history.list', [...this.history]);
    }

    addToQueue(service, id) {
        this.queue.push({ service, id });
        if (this.queue.length < 2) {
            this.loadVideo(service, id);
        }
    }

    removeFromQueue(index) {
        this.queue.splice(index, 1);
        this.broadcastQueue();
    }

    playFromQueue(index) {
        const service = this.queue[index].service;
        const id = this.queue[index].id;
        // move next vid up and play it
        const temp = this.queue.splice(index, 1)[0];
        this.queue.unshift(temp);
        this.loadVideo(service, id);

        this.removeFromQueue(1);
    }

}
