import { Service } from "../modules/Service.js";

export class YouTube extends Service {

    static get serviceName() {
        return "youtube.com";
    }

    static filterServiceId(url) {

        try {
            const parsedURL = new URL(url);

            if (parsedURL.origin.match("youtu.be")) {
                return parsedURL.pathname.substring(1);
            }

            if (parsedURL.origin.match("www.youtube.com")) {
                const split = parsedURL.search.substring(1).split("&");
                for (let part of split) {
                    if (part[0] == "v") {
                        return part.split("=")[1];
                    }
                }
            }
        } catch (err) {
            return null;
        }

        return null;
    }

    static async getThumbnailURL(id) {
        return `https://i1.ytimg.com/vi/${id}/hqdefault.jpg`;
    }

    static getVideoURL(id) {
        return "https://www.youtube.com/watch?v=" + id;
    }

}