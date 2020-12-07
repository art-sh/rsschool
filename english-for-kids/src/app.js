import Library from './js/library.json';
import Menu from './js/components/Menu';
import Router from './js/components/Router';
import View from './js/components/View';
import Storage from './js/components/Storage';

require('./style.scss');

class App {
  constructor(container) {
    this.library = Library;
    this.imagesMap = {};
    this.soundsMap = {};
    this.config = {
      intervals: {
        gameStep: 500,
        popupRedirect: 3000,
      },
    };

    this.requireImages();
    this.requireSounds();

    this.view = new View(this);
    this.menu = new Menu(this);
    this.router = new Router(this, this.view);
    this.game = null;
    this.statistics = null;
    this.storage = new Storage(this);

    this.elements = {
      container: {
        el: container,
      },
      menu: this.menu.getElements(),
      view: this.view.getElements(),
    };

    this.audio = new (window.AudioContext || window.webkitAudioContext)();
    this.soundsBuffer = {};

    alert('По возможности проверьте в последний день дедлайна :)');
  }

  init() {
    this.view.init();
    this.menu.init();

    this.game = this.view.$game;
    this.statistics = this.view.$statistics;
    this.loadSoundsShared();

    this.router.navigate(window.location.hash.slice(2) || 'home', true);
  }

  appendToContainer(node) {
    if (node instanceof HTMLElement) {
      this.elements.container.el.append(node);
    }
  }

  requireImages() {
    const requireImages = require.context('./assets/img', true, /\.(jpg|jpeg|png|svg)$/);

    requireImages.keys().forEach((imagePath) => {
      const importedImage = requireImages(imagePath);

      this.imagesMap[imagePath.slice(2)] = importedImage.default;
    });
  }

  requireSounds() {
    const requireImages = require.context('./assets/sound', true, /\.(mp3)$/);

    requireImages.keys().forEach((imagePath) => {
      const importedImage = requireImages(imagePath);

      this.soundsMap[imagePath.slice(2)] = importedImage.default;
    });
  }

  playSound(category, sound) {
    if (!this.soundsBuffer[category][sound]) return;

    const source = this.audio.createBufferSource();

    source.connect(this.audio.destination);
    source.buffer = this.soundsBuffer[category][sound];
    source.start(0);
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
        .then((buffer) => this.audio.decodeAudioData(buffer, (decodedData) => {
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
          .then((buffer) => this.audio.decodeAudioData(buffer, (decodedData) => {
            this.soundsBuffer[category][key] = decodedData;
          }));
      });
  }

  getCategoryWords(category, full = false) {
    if (!this.library.categories[category]) {
      return [];
    }

    return this.library.categories[category].reduce((out, word) => {
      if (!full) {
        out.push(word.key);
      } else {
        out.push(Object.assign(word, {category}));
      }

      return out;
    }, []);
  }

  containerClassAdd(...className) {
    this.elements.container.el.classList.add(...className);
  }

  containerClassRemove(...classNames) {
    this.elements.container.el.classList.remove(...classNames);
  }
}

const app = new App(document.getElementById('app'));

app.init();
