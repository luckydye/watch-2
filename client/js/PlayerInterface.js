export class PlayerInterface {

    get service() {
        return "player_service";
    }

    constructor(containerId) {
        this.containerId = containerId;
        this.player = null;
    }

    onStateChange(state) {
        // state change hook
    }

    onReady() {
        // rady hook
    }

    setup() {
        // create player api instance etc.
    }

    play() {
        // play video
    }

    pause() {
        // pause video
    }

    seekTo(time) {
        // seek video
    }

    getCurrentTime() {
        // return video timestamp
    }

    getDuration() {
        // return video length
    }

    loadVideo(video) {
        // load video by id
    }

    unloadVideo() {
        // on unload video or video change
    }

}

PlayerInterface.EMPTY = 0;
PlayerInterface.PLAYING = 1;
PlayerInterface.PAUSED = 2;
PlayerInterface.SEEKING = 3;
