export default class AssetsLoader {
  constructor(app) {
    this.$app = app;
    this.library = this.$app.library;
    this.imagesMap = {};
    this.soundsMap = {};
    this.soundsBuffer = {};

    this.requireImages();
    this.requireSounds();
  }

  init() {
    this.loadSoundsShared();
  }

  requireImages() {
    const requireImages = require.context('../../assets/img', true, /\.(jpg|jpeg|png|svg)$/);

    requireImages.keys().forEach((imagePath) => {
      const importedImage = requireImages(imagePath);

      this.imagesMap[imagePath.slice(2)] = importedImage.default;
    });
  }

  requireSounds() {
    const requireImages = require.context('../../assets/sound', true, /\.(mp3)$/);

    requireImages.keys().forEach((imagePath) => {
      const importedImage = requireImages(imagePath);

      this.soundsMap[imagePath.slice(2)] = importedImage.default;
    });
  }

  loadSoundsShared() {
    Object.keys(this.soundsMap).forEach((sound) => {
      if (!sound.includes('shared')) return;

      if (this.soundsBuffer.shared === undefined) {
        this.soundsBuffer.shared = {};
      }

      sound = sound.split('/').pop().split('.').shift();

      fetch(this.soundsMap[`shared/${sound}.mp3`])
        .then((response) => response.arrayBuffer())
        .then((buffer) => this.$app.player.decodeAudioData(buffer, (decodedData) => {
          this.soundsBuffer.shared[sound] = decodedData;
        }));
    });
  }

  loadSoundsByCategory(category) {
    if (!this.library.categories[category] || this.soundsBuffer[category]) {
      return;
    }

    this.library.categories[category]
      .reduce((out, word) => {
        out.push(word.key);

        return out;
      }, [])
      .forEach((key) => {
        if (this.soundsBuffer[category] === undefined) {
          this.soundsBuffer[category] = {};
        }

        fetch(this.soundsMap[`${category}/${key}.mp3`])
          .then((response) => response.arrayBuffer())
          .then((buffer) => this.$app.player.decodeAudioData(buffer, (decodedData) => {
            this.soundsBuffer[category][key] = decodedData;
          }));
      });
  }
}
