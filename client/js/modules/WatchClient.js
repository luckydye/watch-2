export default class Client {

    emit(type, data) {
        this.send({ type, data });
    }

    on(type, callback) {
        if (!this.listeners.has(type)) {
            this.listeners.set(type, []);
        }
        const arr = this.listeners.get(type);
        arr.push(callback);
    }

    constructor() {
        this.connectd = false;
        this.listeners = new Map();
    }

    send(data) {
        if (this.connectd) {
            this.socket.send(JSON.stringify(data));
        }
    }

    sendBinary(data) {
        this.socket.send(data);
    }

    onMessage(e) {
        console.log('[WebSocket] Message recieved', e);

        const listeners = this.listeners.get(e.type);
        if (listeners) {
            for (let listener of listeners) {
                listener(e.data);
            }
        }
    }

    onConnect(e) {
        console.log('[WebSocket] connected to', this.socket.url);
    }

    onError(e) {
        console.log('[WebSocket] error on socket', e);

        this.onClose(e);
    }

    onClose(e) {
        console.log('[WebSocket] socket closed', e);

        const listeners = this.listeners.get('disconnect');
        if (listeners) {
            for (let listener of listeners) {
                listener(e.data);
            }
        }
    }

    connect() {
        return new Promise((resolve, reject) => {
            if (this.connectd) reject('already connected');

            this.protocol = location.protocol == "https:" ? "wss:" : "ws:";

            this.socket = new WebSocket(`${this.protocol}//${location.host}/`);

            this.socket.onmessage = e => {
                if (e.data instanceof Blob) {
                    this.onMessage(e.data);
                } else {
                    try {
                        const json = JSON.parse(e.data);
                        this.onMessage(json);
                    } catch (err) {
                        console.error('recieved unhandled response', err);
                    }
                }
            };

            this.socket.onopen = e => {
                this.connectd = true;
                resolve(this.socket);
                this.onConnect(e);
            }

            this.socket.onerror = e => {
                this.connectd = false;
                reject('error connecting to socket');
                this.onError(e);
            }
            this.socket.onclose = e => {
                this.connectd = false;
                this.onClose(e);
            };
        })
    }

}
