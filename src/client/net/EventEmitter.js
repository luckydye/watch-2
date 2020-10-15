export default class EventEmitter {

    constructor() {
        this.listeners = new Map();
    }

    on(event, callback) {
        if(!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    emit(event, data) {
        if(this.listeners.has(event)) {
            for(let callback of this.listeners.get(event)) {
                callback(data);
            }
        }
    }

}