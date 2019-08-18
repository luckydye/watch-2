import { Service } from "../modules/Service.js";

export class YouTube extends Service {

    static get serviceName() {
        return "youtube.com";
    }

    static get UrlExpression() {
        return /(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/;
    }

    static async getThumbnailURL(id) {
        return `https://i1.ytimg.com/vi/${id}/hqdefault.jpg`;
    }

    static getVideoURL(id) {
        return "https://www.youtube.com/watch?v=" + id;
    }

}