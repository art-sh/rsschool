import Library from './js/library.json';
import Menu from './js/components/Menu';
import Router from './js/components/Router';
import View from './js/components/View';

require('./style.scss');

class App {
  constructor(container) {
    this.library = Library;
    this.imagesMap = {};
    this.soundsMap = {};
    this.config = {};

    this.requireImages();
    this.requireSounds();

    this.view = new View(this);
    this.menu = new Menu(this);
    this.router = new Router(this, this.view);

    this.elements = {
      container: {
        el: container,
      },
      menu: this.menu.getElements(),
    };
  }

  init() {
    this.view.init();
    this.menu.init();

    this.router.navigate(window.location.hash.slice(2) || 'home', true);

    console.log(this);
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

  playSound(sound) {
    console.log('playing', sound);
  }
}

const app = new App(document.getElementById('app'));

app.init();
