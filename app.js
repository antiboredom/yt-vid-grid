const urlParams = new URLSearchParams(window.location.search);
const query = urlParams.get('tag') || "diagrams";

const sheetId = urlParams.get('sheet') || "2PACX-1vQZ_-SmiKjgipjff5LVc5yBV-WaG68EAdl4Sru7bWCjp8Y3xq4lGbgVMGi666xu5kAp3EBCeoksSKME"

const url = `https://docs.google.com/spreadsheets/d/e/${sheetId}/pub?output=csv`
const limit = urlParams.get("limit") || 13;

let loaded = false;

let vids = [];


class Player {
	constructor(id) {
		let holder = document.createElement("div");
		holder.id = id;
		holder.style.gridArea = id;

		document.body.appendChild(holder);

		this.player = new YT.Player(id, {
			height: '100%',
			width: '100%',
			playerVars: { 'controls': 0 },
			events: {
				'onReady': () => {
					this.randomVideo();
				}
			}
		})
	}

	randomVideo() {
		const v = vids[Math.floor(Math.random() * vids.length)];
		this.player.loadVideoById({
			videoId: getYoutubeID(v.url),
			startSeconds: v.start,
			endSeconds: v.end
		})
		// this.player.playVideo();
		setTimeout(this.randomVideo.bind(this), (v.end - v.start) * 1000)
	}
}

function tsToSeconds(ts) {
	let [hours, minutes, seconds] = ts.split(":");
	return parseInt(hours) * 60 * 60 + parseInt(minutes) * 60 + parseInt(seconds);
}

function getYoutubeID(url) {
	const _url = new URL(url);
	const vId = _url.searchParams.get('v');
	return vId;
}

async function load() {
	const response = await fetch(url);
	let lines = await response.text();
	lines = lines.split("\n");
	for (let l of lines) {
		let item = l.split(",");
		let [url, start, end, tag] = item;

		if (!url.startsWith("https")) {
			continue
		}
		if (tag != query) {
			continue
		}

		start = tsToSeconds(start);
		end = tsToSeconds(end);

		let vidSegment = { url, start, end, tag };

		vids.push(vidSegment)
	}

	for (let i = 1; i <= parseInt(limit); i++) {
		new Player('v' + i);
	}
}

function onYouTubeIframeAPIReady() {
	document.querySelector("#loader").textContent = "Click to begin";
	document.body.addEventListener('click', () => {
		if (!loaded) {
			document.querySelector("#loader").style.display = 'none';
			load();
			loaded = true;
		}
	});
}

