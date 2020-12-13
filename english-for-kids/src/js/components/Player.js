export default class Player {
  constructor(app) {
    this.$app = app;

    this.audio = new (window.AudioContext || window.webkitAudioContext)();
    this.soundsBuffer = {};
  }

  init() {
    this.soundsBuffer = this.$app.assetsLoader.soundsBuffer;
  }

  decodeAudioData(buffer, successCb) {
    this.audio.decodeAudioData(buffer, successCb);
  }

  playSound(category, sound) {
    if (!this.soundsBuffer[category][sound]) return;

    const source = this.audio.createBufferSource();

    source.connect(this.audio.destination);
    source.buffer = this.soundsBuffer[category][sound];
    source.start(0);
  }
}
