const services = new Map();

export class Service {

    static valueOf() {
        return this.serviceName;
    }

    static registerService(service) {
        services.set(service.serviceName, service);
    }

    static getService(name) {
        return services.get(name) || Service;
    }

    static filterServiceId(url) {
        return url;
    }

    static parseServiceUrl(url) {
        const ids = [];
        let currentService = null;

        for (let service of services) {
            const id = service[1].filterServiceId(url);
            if (id) {
                ids.push(id);
                currentService = service[1];
            }
        }

        if (ids.length > 0) {
            return {
                id: ids[0],
                service: currentService.serviceName,
                link: url,
            }
        }
        return null;
    }

    // interface

    static get serviceName() {
        return "unknown";
    }

    static async getThumbnailURL(id) {
        return `/res/thumb.png`;
    }

    static async getVideoMetaData(id) {
        return null;
    }

    static getVideoURL(id) {
        console.warn("can't open, unknown service"); r
        return null;
    }

}
