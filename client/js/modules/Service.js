const services = new Map();

export class Service {

    static registerService(service) {
        services.set(service.serviceName, service);
    }

    static getService(name) {
        return services.get(name) || Service;
    }

    static parseServiceUrl(url) {
        const ids = [];

        for (let service of services) {
            const id = url.match(service[1].UrlExpression);
            if (id) {
                ids.push(id[1]);
            }
        }

        if (ids.length > 0) {
            return {
                id: ids[0],
                service: "youtube.com",
                link: url,
            }
        }
        return null;
    }

    // interface

    static get serviceName() {
        return "unknown";
    }

    static get UrlExpression() {
        return /.*/;
    }

    static async getThumbnailURL(id) {
        return `/res/thumb.png`;
    }

    static getVideoURL(id) {
        console.warn("can't open, unknown service"); r
        return null;
    }

}
