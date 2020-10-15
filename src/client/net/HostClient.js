import { uuidv4 } from "../lib/Math.js";
import EventEmitter from "./EventEmitter.js";
import Packet from "./Packet.js";

/*
 * Message Example: 
 * {
 *  type: "connected", ["connected" | "disconnected" | "update"],
 *  message: "", (optional)
 *  data: {}, (message body)
 * }
 * 
 * This structure is valid for client and hsot messages.
 * 
 * This is the message body that should appear in a "*.message" event 
 *   from both Client and ConnectionManger!
 */

export default class HostClient extends EventEmitter {

    constructor(client) {
        super();

        this.maxConnections = 6;

        this.client = client;
        this.connections = new Map();

        console.log('Client id:', this.client.id);

        this.client.peer.on('connection', conn => this.handleConnection(conn));
    }

    handleLostConnection(conn) {
        this.connections.delete(conn.peer);
        this.emit('player.disconnected', {
            connection: conn
        });
    }

    handleMessage(message, conn) {
        if(message instanceof ArrayBuffer) {
            const dataObj = Packet.read(message);

            this.emit('player.update', { 
                connection: conn,
                data: dataObj
            });

        } else {
            const latency = Date.now() - message.timestamp;
            conn.latency = latency;

            const messageType = message.type;

            switch(messageType) {
                case 'ping':
                    conn.send({
                        type: 'pong',
                        message: message.data
                    });
                    break;
                case 'join':
                    const username = message.data.username;
                    this.emit('player.joined', { 
                        connection: conn,
                        data: {
                            username: username,
                            id: uuidv4()
                        }
                    });
                    break;
            }
        }
    }

    sendPacket(packet) {
        for(let [_, connection] of this.connections) {
            connection.send(packet.data);
        }
    }

    send(conn, type, data, message) {
        conn.send({
            type: type,
            message: message,
            data: data
        });
    }

    handleConnection(conn) {
        if(this.connections.size < this.maxConnections) {
            this.connections.set(conn.peer, conn);
            this.emit('player.connected', {
                connection: conn
            });
    
            console.log('Someone connected.');
    
            conn.on('data', (data) => {
                this.handleMessage(data, conn);
            });
    
            conn.on('close', () => {
                this.handleLostConnection(conn);
            });
    
            conn.on('open', () => {
                this.send(conn, 'connected', null, 'Connected successfully');
            });
        } else {
            conn.on('open', () => {
                this.send(conn, 'disconnected', null, 'Lobby is full');
                conn.disconnect();
            });
        }
    }
}
