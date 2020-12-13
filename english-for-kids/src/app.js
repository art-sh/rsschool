import Library from './js/library.json';
import Menu from './js/components/Menu';
import Router from './js/components/Router';
import View from './js/components/View';
import Storage from './js/components/Storage';
import AssetsLoader from './js/components/AssetsLoader';
import Player from './js/components/Player';

require('./style.scss');

class App {
  constructor(container) {
    this.library = Library;
    this.player = new Player(this);
    this.assetsLoader = new AssetsLoader(this);

    this.imagesMap = this.assetsLoader.imagesMap;
    this.soundsMap = this.assetsLoader.soundsMap;
    this.config = {
      intervals: {
        gameStep: 500,
        popupRedirect: 3000,
      },
    };

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
  }

  init() {
    this.view.init();
    this.menu.init();

    this.game = this.view.$game;
    this.statistics = this.view.$statistics;
    this.assetsLoader.init();
    this.player.init();

    this.router.navigate(window.location.hash.slice(2) || 'home', true);
  }

  appendToContainer(node) {
    if (node instanceof HTMLElement) {
      this.elements.container.el.append(node);
    }
  }

  getCategoryWords(category) {
    if (!this.library.categories[category]) {
      return [];
    }

    return this.library.categories[category].reduce((out, word) => {
      out.push(Object.assign(word, {category}));

      return out;
    }, []);
  }

  containerClassAdd(...classNames) {
    this.elements.container.el.classList.add(...classNames);
  }

  containerClassRemove(...classNames) {
    this.elements.container.el.classList.remove(...classNames);
  }
}

const app = new App(document.getElementById('app'));

app.init();
