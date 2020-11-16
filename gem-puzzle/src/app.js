import './index.html';
import './style.scss';
import Game from './game.js';
import Settings from './settings.js';
import Storage from './storage.js';
import Records from './records.js';
import Saves from './saves.js';

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

    window.addEventListener('beforeunload', this.storage.saveCurrentGame.bind(this.storage));

    this.buildContainer();
    this.settings.load();
    this.storage.loadSavedGame();

    this.records.load();
    this.saves.load();

    alert('По возможности проверьте в последний день дедлайна :)');
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

new Puzzle();