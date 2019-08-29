import { PlayerInterface } from '../PlayerInterface.js';

export class FlowPlayer extends PlayerInterface {

    get service() {
        return "flowplayer";
    }

    setup() {

    }

    play() { }

    pause() { }

    seekTo() { }

    getCurrentTime() { }

    getDuration() { }

    loadVideo() { }

}