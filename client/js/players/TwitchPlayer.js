import { PlayerInterface } from '../PlayerInterface.js';

export class TwitchPlayer extends PlayerInterface {

    get service() {
        return "twitch.tv";
    }

    setup() {
        this.player = new Twitch.Player(this.containerId);
        this.player.addEventListener(Twitch.Player.PAUSE, () => {
            this.onStateChange(PlayerInterface.PAUSED);
        })
        this.player.addEventListener(Twitch.Player.PLAYING, () => {
            this.onStateChange(PlayerInterface.PLAYING);
        })
    }

    play() {
        this.player.play();
    }

    pause() {
        this.player.pause();
    }

    seekTo(time) {
        return this.player.seek(time);
    }

    getCurrentTime() {
        return this.player.getCurrentTime();
    }

    getDuration() {
        return this.player.getDuration();
    }

    loadVideo({ service, id, startSeconds }, state) {
        this.player.setVideo("v" + id, startSeconds);
    }

}