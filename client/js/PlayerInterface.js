export class PlayerInterface {

    static EMPTY = 0;
    static PLAYING = 1;
    static PAUSED = 2;
    static SEEKING = 3;

    get service() {
        return "player_service";
    }

    constructor(containerId) {
        this.containerId = containerId;
        this.player = null;

        this.setup();
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

}