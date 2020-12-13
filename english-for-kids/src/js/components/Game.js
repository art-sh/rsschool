export default class Game {
  constructor(app, view, statistics) {
    this.$app = app;
    this.$view = view;
    this.$stats = null;
    this.$statistics = statistics;

    this.MODES = Object.freeze({
      PLAY: 'play',
      TRAIN: 'train',
    });

    this.isActive = false;
    this.currentMode = this.MODES.TRAIN;
    this.gameWords = [];
    this.stats = {
      right: 0,
      wrong: 0,
    };
  }

  init() {
    this.$stats = this.$view.elements.content.gameStats.container.el;

    this.toggleTrain();
  }

  toggleGame() {
    this.currentMode = this.MODES.PLAY;
    this.$app.containerClassAdd('mode-play');
    this.$app.containerClassRemove('mode-train');
  }

  toggleTrain() {
    this.currentMode = this.MODES.TRAIN;
    this.$app.containerClassAdd('mode-train');
    this.$app.containerClassRemove('mode-play');

    this.stopGame();
  }

  fillGameWordsByCategory(category) {
    this.gameWords.length = 0;
    const categoryWords = this.$app.getCategoryWords(category);

    categoryWords.sort(() => Math.random() - 0.5).forEach((word) => this.gameWords.push(word));
  }

  fillGameWordsDifficult(collection) {
    this.gameWords.length = 0;

    if (!collection.length) return;

    collection.forEach((word) => this.gameWords.push(word));
  }

  startGame() {
    this.stopGame();

    this.isActive = true;
    this.$app.containerClassAdd('game-active');

    setTimeout(this.sayCurrentWord.bind(this), this.$app.config.intervals.gameStep);
  }

  stopGame() {
    this.isActive = false;

    this.stats.right = 0;
    this.stats.wrong = 0;

    this.$stats.innerHTML = '';
    this.$app.containerClassRemove('game-active');

    Object.values(this.$view.wordsCollection).forEach((node) => node.classList.remove('inactive'));
  }

  getCurrentWordObj() {
    if (!this.gameWords[0]) {
      throw new Error('Invalid word');
    }

    return this.gameWords[0];
  }

  getCurrentWord() {
    if (!this.getCurrentWordObj().key) {
      throw new Error('Invalid word object');
    }

    return this.getCurrentWordObj().key;
  }

  sayCurrentWord() {
    if (!this.gameWords.length) return;

    this.$app.player.playSound(this.getCurrentWordObj().category, this.getCurrentWord());
  }

  validateAnswer(word) {
    if (!this.gameWords.length) return;

    const isRight = word === this.getCurrentWord();

    if (isRight) {
      this.$view.wordsCollection[word].classList.add('inactive');
      this.$app.player.playSound('shared', 'correct');

      this.stats.right += 1;
      this.addStatRight();
      this.$statistics.addCountByType(this.getCurrentWordObj().category, this.getCurrentWord(), this.$statistics.keys.gameRight);

      this.gameWords.shift();

      if (!this.gameWords.length) {
        this.popupShow();

        setTimeout(() => {
          this.$app.player.playSound('shared', (this.stats.wrong) ? 'failure' : 'success');
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
      this.$app.player.playSound('shared', 'error');

      this.stats.wrong += 1;
      this.addStatWrong();
      this.$statistics.addCountByType(this.getCurrentWordObj().category, this.getCurrentWord(), this.$statistics.keys.gameWrong);
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
