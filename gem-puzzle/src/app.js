import './index.html';
import './style.scss';
import Game from './game';
import Settings from './settings';
import Storage from './storage';
import Records from './records';
import Saves from './saves';

class Puzzle {
  constructor() {
    this.game = new Game(this);
    this.storage = new Storage(this);
    this.records = new Records(this);
    this.saves = new Saves(this);
    this.settings = new Settings(this);

    this.config = this.settings.config;

    this.elements = {
      container: {
        class: 'puzzle',
        el: null,
      },
      game: this.game.elements,
      settings: this.settings.elements,
      records: this.records.elements,
    };
  }

  init() {
    window.addEventListener('beforeunload', this.storage.saveCurrentGame.bind(this.storage));

    this.buildContainer();
    this.settings.load();
    this.storage.loadSavedGame();

    this.records.load();
    this.saves.load();
  }

  buildContainer() {
    this.elements.container.el = document.createElement('div');
    this.elements.container.el.className = this.elements.container.class;

    document.body.append(this.elements.container.el);
  }

  appendToMainContainer(node) {
    this.elements.container.el.append(node);
  }
}

const app = new Puzzle();

app.init();
