import { PlayerInterface } from '../PlayerInterface.js';
import { Service } from '../Service.js';

export class IFramePlayer extends PlayerInterface {

    get service() {
        return "iframe";
    }

    loadVideo({ service, id, startSeconds }, state) {
        document.querySelector('#' + this.containerId).innerHTML = `
            <iframe
                src="${Service.getService(service).getVideoURL(id)}"
                frameborder="none"
            </iframe>
        `;
    }

}