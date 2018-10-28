interface IVideos {
	id: string,
	name: string
};

const sourceVideos: IVideos[] = [
	{
		id: 'video-1',
		name: 'sosed'
	},
	{
		id: 'video-2',
		name: 'cat'
	},
	{
		id: 'video-3',
		name: 'dog'
	},
	{
		id: 'video-4',
		name: 'hall'
	}
];

interface IFilter {
	id: string,
	brightness: number;
	contrast: number;
}

const filterVideos: IFilter[] = [
	{
		id: 'video-1',
		brightness: 100,
		contrast: 100
	},
	{
		id: 'video-2',
		brightness: 100,
		contrast: 100
	},
	{
		id: 'video-3',		
		brightness: 100,
		contrast: 100
	},
	{
		id: 'video-4',		
		brightness: 100,
		contrast: 100
	}
];

function getFiltersId(video: HTMLVideoElement): number {
	for (let i = 0; i < filterVideos.length; i++) {
		if (video.id === filterVideos[i].id) {
			return i;
		}
	}
	return -1;
}

function setFilter(video: HTMLVideoElement) {
	let filterId = getFiltersId(video);

	let {brightness, contrast} = filterVideos[filterId];
	video.style.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
}

function initVideo(video: HTMLVideoElement, url: string) {
	if (Hls.isSupported()) {
		var hls = new Hls();

		hls.loadSource(url);
		hls.attachMedia(video);
		
		hls.on(Hls.Events.MANIFEST_PARSED, function () {
			video.play();
		});
	} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
		video.src = 'https://video-dev.github.io/streams/x36xhzz/x36xhzz.m3u8';

		video.addEventListener('loadedmetadata', function () {
			video.play();
		});
	}
}

function openControls(video: HTMLVideoElement) {
	let controls: HTMLElement | null = document.querySelector('.cams__control');
	if (controls)
		controls.classList.remove('cams__control_hidden');

	let bright: HTMLInputElement | null = document.querySelector('.bright');
	let contrast: HTMLInputElement | null = document.querySelector('.contrast');

	let filterId = getFiltersId(video);
	
	if (bright) {
		bright.oninput = (event: Event) => {
			let target: HTMLInputElement | null = <HTMLInputElement>event.target;

			if (target) {
				
				filterVideos[filterId].brightness = target.valueAsNumber * 4;
			}
			setFilter(video);
		};

		if (bright)
			bright.value = `${filterVideos[filterId].brightness / 4}`;
	}
		
	if (contrast) {
		contrast.oninput = (event: Event) => {
			let target: HTMLInputElement | null = <HTMLInputElement>event.target;

			if (target)
				filterVideos[filterId].contrast = target.valueAsNumber * 4;

			setFilter(video);
		};
		contrast.value = `${filterVideos[filterId].contrast / 4}`;
	}

}

function expandVideo(video: HTMLVideoElement) {
	video.classList.add("video_opened");
}

function openVideo(video: HTMLVideoElement) {
	let isAlreadyOpen = document.querySelector('.video_opened');

	if (!isAlreadyOpen) {
		expandVideo(video);
		openControls(video);

		video.classList.add("video_opened");

		video.muted = false;
	}
}

function closeControls() {
	let controls: HTMLElement | null = document.querySelector('.cams__control');
	if (controls)
		controls.classList.add('cams__control_hidden');
}

function closeVideo() {
	let video: HTMLVideoElement | null  = document.querySelector('.video_opened');
	if (video) {
		video.classList.remove("video_opened");
		video.muted = true;
	}

	closeControls();
}

window.onload = () => {
	
	sourceVideos.forEach( video => {
		let el: HTMLVideoElement | null = document.querySelector(`#${video.id}`); 
		if (el)
			initVideo(
				el,
				`http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2F${video.name}%2Fmaster.m3u8`
			)
	})
};