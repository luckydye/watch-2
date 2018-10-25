window.addEventListener("DOMContentLoaded", () => {

	const watchRoomUrl = (id) => "https://watch.luckydye.de/r/" + id;
	const ytidToThumbnailUrl = (id) => `https://i1.ytimg.com/vi/${id}/hqdefault.jpg`;
	
	const createRoomContainer = (data = {}) => {
		const container = document.createElement("div");
		container.className = "room-container";
		container.innerHTML = `
			<div class="thumbnail-container">
				<img src="${ytidToThumbnailUrl(data.videoId)}"/>
			</div>
			<div class="details-container">
				<div class="room-id">${data.id}</div>
				<a href="${watchRoomUrl(data.id)}">
					<button class="join-button">Join Room</button>
				</a>
			</div>
		`;
		return container;
	}
	
	const getOpenRooms = () => {
		const url = `${location.origin}/api/v1/rooms`;
		return fetch(url).then(data => data.json().then(jsonData => {
			if(!jsonData.error) {
				return jsonData.response;
			} else {
				throw "Error retrieving room data";
			}
		}))
	}

	const listContainer = document.querySelector(".rooms-list");

	getOpenRooms().then(rooms => {
		for(let room of rooms) {
			const ele = createRoomContainer({
				id: room.id,
				videoId: room.state.video.id,
			});
			listContainer.appendChild(ele);
		}
	})
})