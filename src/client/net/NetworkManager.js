import { Notification } from '../lib/Notifications';
import HostClient from '../net/HostClient';

let instance = null;

export default class NetworkManager {

    static getInstance() {
        return instance;
    }

    connect(id) {
        this.client.connect(id);
    }

    loadVideo({ index, id }) {
        
    }

    addVideoToQueue(service, id) {

    }

    removeVideoFromQueue({ index, id }) {

    }

    seekVideo(time) {
        
    }

    pauseVideo() {

    }

    playVideo() {

    }

    constructor() {
        instance = this;
    }

    setClient(client, player) {
        this.player = player;
        this.client = client;
        this.hostClient = new HostClient(this.client);

        this.players = new Map();

        this.players.set(this.client.id, this.player);

        // sets up client to recieve updates from the host
        this.client.on('connected', conn => {
            new Notification({ text: 'Connected to host.', time: 1000 * 3 }).show();
        });
        this.client.on('disconnected', () => {
            new Notification({ text: 'Disconnected from host.', time: 1000 * 3 }).show();
        });
        this.client.on('host.state', msg => {
            
        });
        
        this.initConnectionsManager();
    }

    initConnectionsManager() {
        this.hostClient.on('player.joined', ({ data, connection }) => {
            
        });
        this.hostClient.on('player.update', ({ data, connection }) => {
            
        });
    }

}
