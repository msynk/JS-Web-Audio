var _view = JSV.init('app');
var _context = new AudioContext();
var _analyserNode = new AnalyserNode(_context, { fft: 256 });
var _gainNode = new GainNode(_context, { gain: _view.volume.value });
var _bassEq = new BiquadFilterNode(_context, {
    type: 'lowshelf',
    frequency: 500,
    gain: _view.bass.value
});
var _midEq = new BiquadFilterNode(_context, {
    type: 'peaking',
    Q: Math.SQRT1_2,
    frequency: 1500,
    gain: _view.mid.value
});
var _trebleEq = new BiquadFilterNode(_context, {
    type: 'highshelf',
    frequency: 3000,
    gain: _view.treble.value
});

setupEventListeners();
setupAudioContext();
resize();
drawVisualizer();

function setupEventListeners() {
    window.addEventListener('resize', resize);

    _view.volume.addEventListener('input', e => {
        var value = parseFloat(e.target.value);
        _gainNode.gain.setTargetAtTime(value, _context.currentTime, 0.01);
    });

    _view.bass.addEventListener('input', e => {
        var value = parseInt(e.target.value);
        _bassEq.gain.setTargetAtTime(value, _context.currentTime, 0.01);
    });

    _view.mid.addEventListener('input', e => {
        var value = parseInt(e.target.value);
        _midEq.gain.setTargetAtTime(value, _context.currentTime, 0.01);
    });

    _view.treble.addEventListener('input', e => {
        var value = parseInt(e.target.value);
        _trebleEq.gain.setTargetAtTime(value, _context.currentTime, 0.01);
    });

}

async function setupAudioContext() {
    var mediaStream = await getMediaStream();
    if (_context.state === 'suspended') {
        await _context.resume();
    }
    var source = _context.createMediaStreamSource(mediaStream);
    source
        .connect(_gainNode)
        .connect(_bassEq)
        .connect(_midEq)
        .connect(_trebleEq)
        .connect(_analyserNode)
        .connect(_context.destination);
}

function getMediaStream() {
    return navigator.mediaDevices.getUserMedia({
        audio: {
            echoCancellation: false,
            autoGainControl: false,
            noiseSuppression: false,
            latency: 0
        }
    })
}

function drawVisualizer() {
    requestAnimationFrame(drawVisualizer);

    var bufferLength = _analyserNode.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);
    _analyserNode.getByteFrequencyData(dataArray);
    var width = _view.visualizer.width;
    var height = _view.visualizer.height;
    var barWidth = width / bufferLength;
    var canvasContext = _view.visualizer.getContext('2d');
    canvasContext.clearRect(0, 0, width, height);
    dataArray.forEach((item, index) => {
        var y = item / 255 * height / 2;
        var x = barWidth * index;
        canvasContext.fillStyle = `hsl(${y / height * 400}, 100%, 50%)`;
        canvasContext.fillRect(x, height - y, barWidth, y);
    })
}

function resize() {
    _view.visualizer.width = _view.visualizer.clientWidth * window.devicePixelRatio;
    _view.visualizer.height = _view.visualizer.clientHeight * window.devicePixelRatio;
}