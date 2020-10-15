import { PlayerInterface } from './PlayerInterface.js';
import { Service } from '../services/Service.js';

export class IFramePlayer extends PlayerInterface {

    get service() {
        return "iframe";
    }

    loadVideo({ service, id, startSeconds }, state) {
        const playerService = Service.getService(service);

        if (!playerService) return;

        document.querySelector('#' + this.containerId).innerHTML = `
            <iframe
                src="${playerService.getVideoURL(id)}"
                frameborder="none"
            </iframe>
        `;
    }

    unloadVideo() {
        document.querySelector('#' + this.containerId).innerHTML = "";
    }

}