import { Service } from "../modules/Service.js";

export class IFrame extends Service {

    static get serviceName() {
        return "iframe";
    }

    static get UrlExpression() {
        return /(?:clips.twitch.tv\/)([^\s&]+)/;
    }

    static getVideoURL(id) {
        return `https://clips.twitch.tv/${id}`;
    }

}
