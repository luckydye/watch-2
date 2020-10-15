import { Service } from "./Service.js";

export class IFrames extends Service {

    static get serviceName() {
        return "iframe";
    }

    static filterServiceId(url) {

        if (url.match("clips.twitch.tv")) {
            const split = url.split("/");
            return "twitchclip:" + split[split.length - 1];
        }

        if (url.match(/(https:\/\/www\.twitch\.tv\/.*\/clip\/([^\s&]+))/g)) {
            const split = url.split("/");
            return "twitchchannelclip:" + split[split.length - 1].split("?")[0];
        }

        // if (url.match(/\.twitch.tv\/.+/g)) {
        //     const split = url.split("/");
        //     return "twitch:" + split[split.length - 1];
        // }
    }

    static getVideoURL(id) {
        const ID = id.split(":");

        switch (ID[0]) {
            case "twitchclip": return `https://clips.twitch.tv/embed?clip=${ID[1]}`;
            case "twitchchannelclip": return `https://clips.twitch.tv/embed?clip=${ID[1]}`;
            case "twitch": return `https://player.twitch.tv/?channel=${ID[1]}`;
        }
    }

}
