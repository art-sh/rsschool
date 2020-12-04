import Library from './js/library.json';
import Menu from './js/components/Menu';

require('./style.scss');

class App {
  constructor(container) {
    this.library = Library;
    this.imagesMap = {};
    this.config = {};

    this.requireImages();

    this.menu = new Menu(this);

    this.elements = {
      container: {
        el: container,
      },
      menu: this.menu.getElements(),
    };
  }

  init() {
    this.menu.init();

    console.log(this);
  }

  requireImages() {
    const requireImages = require.context('./assets/img', true, /\.(jpg|jpeg|png|svg)$/);

    requireImages.keys().forEach((imagePath) => {
      const importedImage = requireImages(imagePath);

      this.imagesMap[imagePath.slice(2)] = importedImage.default;
    });
  }
}

const app = new App(document.getElementById('app'));

app.init();
