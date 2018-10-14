window.onload = function (params) {
  initVideo(
    document.getElementById('video-1'),
    'http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2Fsosed%2Fmaster.m3u8'
  );
  
  initVideo(
    document.getElementById('video-2'),
    'http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2Fcat%2Fmaster.m3u8'
  );
  
  initVideo(
    document.getElementById('video-3'),
    'http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2Fdog%2Fmaster.m3u8'
  );
  
  initVideo(
    document.getElementById('video-4'),
    'http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2Fhall%2Fmaster.m3u8'
  );
}

function initVideo(video, url) {
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

  let AudioContext = window.AudioContext || window.webkitAudioContext;
  let audioCtx = new AudioContext();
  let source = audioCtx.createMediaElementSource(video);
  let analyser = audioCtx.createAnalyser();
  let processor = audioCtx.createScriptProcessor(2048, 1, 1);
  
  source.connect(analyser);
  source.connect(processor);
  analyser.connect(audioCtx.destination);
  processor.connect(audioCtx.destination);
  analyser.fftSize = 128;
  
  let data = new Uint8Array(analyser.frequencyBinCount);
  let levelVolume = document.querySelector(`#level-${video.id} > .level__hider`);

  processor.onaudioprocess = function() {
    analyser.getByteFrequencyData(data);
    let summ = 0;

    for (let i = 0; i < data.length; i++) {
      summ += data[i];
    }

    summ = summ / data.length;
    levelVolume.style.width = `${100 - ((summ * 100) / 128)}%`;
  };
  
  video.addEventListener('click', () => { // Добавил для Safari, но анализатор звука
    audioCtx.resume();                    // даже так не работает. Возращает массив с "ноликами"
  })                                      // Решить проблему не удалось.
}

function openVideo(video) {
  let test = document.querySelector('.video_opened');
  if (!test) {
    video.classList.add("video_opened");
    let controls = document.querySelector('.cams__control');
    controls.classList.remove('cams__control_hidden');

    if (!video.style.filter) video.style.filter = 'brightness(100%) contrast(100%)';

    let brightness = getFilter(video.style.filter, 'brightness');
    let contrast = getFilter(video.style.filter, 'contrast');
    
    document.querySelector('.bright').value = brightness / 4;
    document.querySelector('.contrast').value = contrast / 4;
    document.querySelector(`#level-${video.id}`).classList.add('level_visible');
    video.muted = false;
  }
}

function closeVideo() {
  let video = document.querySelector('.video_opened');
  video.classList.remove("video_opened")
  let controls = document.querySelector('.cams__control');
  controls.classList.add('cams__control_hidden')
  document.querySelector(`#level-${video.id}`).classList.remove('level_visible');

  video.muted = true;
}

function changeBright(value) {
  let video = document.querySelector('.video_opened');

  let contrast = getFilter(video.style.filter, 'contrast');
  if(!contrast) contrast = 100;
  
  video.style.filter = `brightness(${value*4}%) contrast(${contrast}%)`
  
}

function changeContrast(value) {
  let video = document.querySelector('.video_opened');

  let brightness = getFilter(video.style.filter, 'brightness');
  if(!brightness) brightness = 100;

  video.style.filter = `brightness(${brightness}%) contrast(${value*4}%)`
}

function getFilter(str, type) {
  if (str.length == 0) return 100;
  let shift = (type == 'brightness')?11:9;
  let scaleStart = str.indexOf(type);
  return str.slice(scaleStart + shift, str.indexOf(")", scaleStart)-1);
}

