import Peer from 'peerjs';
import { uuidv4 } from '../../../lib/Math';
import EventEmitter from './EventEmitter';
import Packet from './Packet';
import PacketTypes from './PacketTypes';

export default class Client extends EventEmitter {

    get connected() {
        return this.connection ? true : false;
    }

    get ping() {
        return this._latency;
    }
    
    constructor() {
        super();
        
        this.id = uuidv4();
        this.peer = new Peer(this.id);
        this.connection = null;
        this.modelId = null;
        this._latency = 0;
        
        setInterval(() => {
            if(this.connected) {
                this.send('ping', { timestamp: Date.now() });
            }
        }, 1000);
    }

    sendInput(inputObj) {
        const packet = new Packet(PacketTypes.PlayerInput);
        packet.write(inputObj);
        this.sendPacket(packet);
    }

    sendPacket(packet) {
        this.connection.send(packet.data);
    }

    send(type, data) {
        if(this.connection) {
            this.connection.send({
                type: type,
                data: data
            });
        } else {
            throw new Error('Client not connected, could not send message.');
        }
    }

    onConnected() {
        console.log('Connected to host.');
        this.emit('connected', this.connection);

        this.send('join', {
            username: 'dummy_' + Math.floor(Math.random() * 10000)
        });
    }

    handleMessage(message) {
        if(message instanceof ArrayBuffer) {
            const dataObj = Packet.read(message);
            this.emit('host.state', dataObj);
        } else {
            const messageType = message.type;

            switch(messageType) {
                case 'pong':
                    this._latency = Date.now() - message.message.timestamp;
                    break;
            }
        }
    }

    connect(peerId) {
        this.connection = this.peer.connect(peerId);
        const conn = this.connection;

        conn.on('open', () => this.onConnected());
        conn.on('data', data => this.handleMessage(data));
        conn.on('close', () => this.handleConnectionLost());
    }

    handleConnectionLost() {
        console.log('Connection to host lost');
        this.emit('disconnected');
    }

}
