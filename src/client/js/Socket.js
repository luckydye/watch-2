export class Socket {

	constructor() {
		const socket = io();
		
		socket.on('user connected', function(msg) {
			displayNotification(msg.username + " connected", 2000);
		});
		
		socket.on('user disconnected', function(msg) {
			displayNotification(msg.username + " disconnected", 2000);
		});
	}

}