import Library from './js/library.json';
import Menu from './js/components/Menu';
import Router from './js/components/Router';
import View from './js/components/View';

require('./style.scss');

class App {
  constructor(container) {
    this.library = Library;
    this.imagesMap = {};
    this.config = {};

    this.requireImages();

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

    this.router.navigate('home', true);

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
}

const app = new App(document.getElementById('app'));

app.init();
