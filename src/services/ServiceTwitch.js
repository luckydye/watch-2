import { Service } from "../Service.js";

export class Twitch extends Service {

    static get serviceName() {
        return "twitch.tv";
    }

    static filterServiceId(url) {
        const match = url.match(/(?:twitch.tv\/videos\/)([^\s&]+)/);
        return match ? match[1] : null;
    }

    static async getThumbnailURL(id) {
        const clientId = "mdn23u65h8g1mxrg0kr9yaw51vivmj";
        const url = `https://api.twitch.tv/kraken/videos/${id}?client_id=${clientId}`;
        return fetch(url).then(res => res.json().then(json => {
            return json.thumbnails[0].url;
        }));
    }

    static getVideoURL(id) {
        return "https://www.twitch.tv/videos/" + id;
    }

}