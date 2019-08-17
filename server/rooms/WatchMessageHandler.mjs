import { MessageHandler, Message } from '@uncut/hotel';
import RoomStateMessage from '@uncut/hotel/src/messages/RoomStateMessage.mjs';
import WatchRoom from './WatchRoom.mjs';

/* TODO:
- Send Player State to Server.
- Merge Player State with Server State.
- Broadcast new State
*/

export default class WatchMessageHandler extends MessageHandler {

    static get Room() {
        return WatchRoom;
    }

    get messageTypes() {
        return Object.assign(super.messageTypes, {
            'room.state': msg => this.handleRoomState(msg),
            'queue.add': msg => this.handleQueueAdd(msg),
            'queue.remove': msg => this.handleQueueRemove(msg),
            'queue.play': msg => this.handleQueuePlay(msg),
            'play.video': msg => this.handlePlayVideo(msg),
            'pause.video': msg => this.handlePauseVideo(msg),
            'seek.video': msg => this.handleSeekVideo(msg),
            'player.state': msg => this.handlePlayerState(msg),
        });
    }

    handleJoinMessage(message) {
        super.handleJoinMessage(message);

        const room = this.getRoom(message.socket.room);

        // TODO: no no
        room.handler = this;

        message.reply(new Message('queue.list', room.queue));
        message.reply(new Message('history.list', [...room.history]));

        const videoid = room.state.video.id || room.queue[1];

        if (videoid) {
            message.reply(new Message('player.state', {
                service: room.state.video.service,
                id: videoid,
                time: room.state.video.time || 0,
                timestamp: room.state.video.timestamp || 0,
                state: room.state.video.state,
            }));
        }

        room.socketConnected(message.socket);

        message.reply(new Message('room.state', {
            host: room.hostId == message.socket.uid,
            saved: room.state.saved
        }));

        this.broadcastUserlist(room);
    }

    broadcastQueue(room) {
        this.broadcast(room, new Message('queue.list', room.queue));
    }

    broadcastUserlist(room) {
        const list = [];
        for (let user of room.userlist) {
            list.push({
                username: user[1].username,
                host: user[0] == room.hostId
            })
        }
        this.broadcast(room, new Message('user.list', list));
    }

    handleLeaveMessage(message) {
        super.handleLeaveMessage(message);

        const room = this.getRoom(message.socket.room);

        if (room) {
            room.socketDisconnected(message.socket);

            this.broadcast(room, new Message('message', {
                message: message.socket.username + " left"
            }));

            this.broadcastUserlist(room);
        }
    }

    handleRoomState(msg) {
        const room = this.getRoom(msg.socket.room);
        if (room.hostId == socket.id) {
            room.state.saved = msg.data.saved;
        }
        broadcast('room.state', room.getRoomState());
    }

    handleQueueAdd(msg) {
        const room = this.getRoom(msg.socket.room);

        const vid = msg.data;

        room.addToQueue(vid.service, vid.id);

        this.broadcast(room, new Message('message', {
            message: vid.id + " added by " + msg.socket.username
        }));

        this.broadcastQueue(room);
    }

    handleQueueRemove(msg) {
        const room = this.getRoom(msg.socket.room);
        room.removeFromQueue(msg.data.index);

        const username = msg.socket.username;
        this.broadcast(room, new Message('message', { message: username + " removed " + msg.data.id }));

        this.broadcastQueue(room);
    }

    handleQueuePlay(msg) {
        const room = this.getRoom(msg.socket.room);
        room.playFromQueue(msg.data.index, msg.data.id);

        this.broadcastQueue(room);
    }

    handlePlayVideo(msg) {
        const room = this.getRoom(msg.socket.room);
        room.playVideo();

        const username = msg.socket.username;

        this.broadcast(room, new Message('play.video'));
        this.broadcast(room, new Message('message', { message: username + " pressed play" }));
    }

    handlePauseVideo(msg) {
        const room = this.getRoom(msg.socket.room);
        room.pauseVideo();

        const username = msg.socket.username;

        this.broadcast(room, new Message('pause.video'));
        this.broadcast(room, new Message('message', { message: username + " pressed pause" }));
    }

    handleSeekVideo(msg) {
        const room = this.getRoom(msg.socket.room);
        room.seekToVideo(msg.data.time);
    }

    handlePlayerState(msg) {
        const room = this.getRoom(msg.socket.room);
        const socket = msg.socket;

        if (room) {
            if (socket.uid === room.hostId) {
                room.syncPlayerState(msg.data);
            }
        }
    }

}
