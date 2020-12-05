export default class Game {
  constructor(app, view) {
    this.$app = app;
    this.$view = view;
    this.$stats = view.elements.content.gameStats.container.el;

    Object.defineProperty(this, 'MODE_PLAY', {
      value: 'play',
      writable: false,
    });

    Object.defineProperty(this, 'MODE_TRAIN', {
      value: 'train',
      writable: false,
    });

    this.currentMode = null;
    this.category = null;
    this.gameWords = [];
    this.stats = {
      right: 0,
      wrong: 0,
    };

    this.setGameListeners();
    this.toggleTrain();
  }

  toggleGame() {
    this.currentMode = this.MODE_PLAY;
    this.$app.containerClassAdd('mode-play');
    this.$app.containerClassRemove('mode-train');
  }

  toggleTrain() {
    this.currentMode = this.MODE_TRAIN;
    this.$app.containerClassAdd('mode-train');
    this.$app.containerClassRemove('mode-play');

    this.stopGame();
  }

  setGameListeners() {
    this.$view.elements.content.header.mode.play.el.addEventListener('click', this.toggleGame.bind(this));
    this.$view.elements.content.header.mode.train.el.addEventListener('click', this.toggleTrain.bind(this));
    this.$view.elements.content.header.game.start.el.addEventListener('click', this.startGame.bind(this));
    this.$view.elements.content.header.game.repeat.el.addEventListener('click', this.sayCurrentWord.bind(this));
  }

  startGame() {
    this.stopGame();

    this.$app.containerClassAdd('game-active');

    const category = this.$app.router.currentRoute.split('/').pop();
    const categoryWords = this.$app.getCategoryWords(category);

    if (!categoryWords.length) return;

    this.category = category;

    categoryWords.sort(() => Math.random() - 0.5).forEach((word) => {
      this.gameWords.push(word);
    });

    setTimeout(this.sayCurrentWord.bind(this), this.$app.config.intervals.gameStep);
  }

  stopGame() {
    this.gameWords.length = 0;
    this.category = null;
    this.stats.right = 0;
    this.stats.wrong = 0;

    this.$stats.innerHTML = '';
    this.$app.containerClassRemove('game-active');

    Object.values(this.$view.wordsCollection).forEach((node) => node.classList.remove('inactive'));
  }

  getCurrentWord() {
    return this.gameWords[0] || null;
  }

  sayCurrentWord() {
    if (!this.gameWords.length) return;

    this.$app.playSound(this.category, this.getCurrentWord());
  }

  validateAnswer(word) {
    if (!this.gameWords.length) return;

    const isRight = word === this.getCurrentWord();

    if (isRight) {
      this.$view.wordsCollection[word].classList.add('inactive');
      this.$app.playSound('shared', 'correct');

      this.stats.right += 1;
      this.addStatRight();

      this.gameWords.shift();

      if (!this.gameWords.length) {
        this.popupShow();

        setTimeout(() => {
          this.$app.playSound('shared', (this.stats.wrong) ? 'failure' : 'success');
        }, this.$app.config.intervals.gameStep);

        setTimeout(() => {
          this.popupHide();
          this.$app.router.navigate('home');

          this.stopGame();
        }, this.$app.config.intervals.popupRedirect);
      } else {
        setTimeout(this.sayCurrentWord.bind(this), this.$app.config.intervals.gameStep);
      }
    } else {
      this.$app.playSound('shared', 'error');

      this.stats.wrong += 1;
      this.addStatWrong();
    }
  }

  addStatRight() {
    const success = document.createElement('div');
    success.className = this.$view.elements.content.gameStats.item.class;
    success.classList.add(`${this.$view.elements.content.gameStats.item.class}--success`);

    this.$stats.prepend(success);
  }

  addStatWrong() {
    const wrong = document.createElement('div');
    wrong.className = this.$view.elements.content.gameStats.item.class;
    wrong.classList.add(`${this.$view.elements.content.gameStats.item.class}--wrong`);

    this.$stats.prepend(wrong);
  }

  popupShow() {
    const popupNode = this.$view.elements.content.popup.container.el;

    popupNode.innerHTML = `<span>${((this.stats.wrong) ? '😭' : '😁')}</span>
        <span>Right: <b>${this.stats.right}</b></span>
        <span>Errors: <b>${this.stats.wrong}</b></span>`;
    this.$app.containerClassAdd('popup-show');
  }

  popupHide() {
    const popupNode = this.$view.elements.content.popup.container.el;

    popupNode.innerHTML = '';
    this.$app.containerClassRemove('popup-show');
  }
}
