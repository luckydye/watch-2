import { Service } from "../Service.js";

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

    static async getVideoMetaData(id) {
        const key = 'AIzaSyC4wOJP8qY0v2D54DPuOsXimxuDEbbuU3Q';
        const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${id}&key=${key}`;
        return fetch(url).then(async res => {
            const json = await res.json();

            if (json.items.length > 0) {
                const item = json.items[0];

                return {
                    viewCount: item.statistics.viewCount,
                    likeCount: item.statistics.likeCount,
                    dislikeCount: item.statistics.dislikeCount,
                };
            }
        })
    }

    static getVideoURL(id) {
        return "https://www.youtube.com/watch?v=" + id;
    }

}