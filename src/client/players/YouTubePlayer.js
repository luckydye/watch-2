import { PlayerInterface } from './PlayerInterface.js';

export class YouTubePlayer extends PlayerInterface {

    get service() {
        return "youtube.com";
    }

    setup() {
        this.player = new YT.Player(this.containerId, {
            events: {
                'onStateChange': state => {
                    this.onStateChange(state.data);
                },
                'onReady': () => {
                    this.onReady();
                }
            }
        })
    }

    play() {
        this.player.playVideo();
    }

    pause() {
        this.player.pauseVideo();
    }

    seekTo(time) {
        return this.player.seekTo(time);
    }

    getCurrentTime() {
        return this.player.getCurrentTime();
    }

    getDuration() {
        return this.player.getDuration();
    }

    loadVideo({ service, id, startSeconds }, state) {
        this.player.loadVideoById({
            videoId: id,
            startSeconds: startSeconds,
        });
    }

}