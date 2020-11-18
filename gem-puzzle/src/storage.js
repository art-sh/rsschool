export default class Storage {
  constructor(app) {
    this.$app = app;

    this.keys = {
      config: '__settings',
      save: '__savedGames',
      best: '__bestGames',
    };
  }

  toJson(data) {
    return JSON.stringify(data);
  }

  fromJson(data) {
    return JSON.parse(data);
  }

  getItem(key) {
    try {
      return this.fromJson(localStorage.getItem(key));
    } catch (e) {
      return null;
    }
  }

  setItem(key, value) {
    localStorage.setItem(key, this.toJson(value));
  }

  saveCurrentSettings() {
    this.setItem(this.keys.config, this.$app.config);
  }

  getLoadedSettings() {
    return this.getItem(this.keys.config);
  }

  getSavedGames() {
    return this.getItem(this.keys.save) || [];
  }

  loadSavedGame(gameID = null) {
    let loadedInfo = this.getSavedGames();

    loadedInfo = (gameID)
      ? loadedInfo.find((save) => save.game.id === gameID) || false
      : loadedInfo[loadedInfo.length - 1] || false;

    if (!loadedInfo) {
      this.$app.game.startNewGame();

      return;
    }

    this.$app.game.id = loadedInfo.game.id;
    this.$app.game.loadedData = loadedInfo.game;

    this.$app.config.columns = loadedInfo.config.columns;
    this.$app.config.rows = loadedInfo.config.rows;

    this.$app.game.startNewGame();
  }

  removeSavedGame(gameID = null) {
    if (!gameID)
      return;

    let savedGames = this.getSavedGames();

    savedGames.forEach((save, index) => {
      if (save.game.id === gameID)
        savedGames.splice(index, 1);
    });

    this.setItem(this.keys.save, savedGames);
  }

  saveCurrentGame() {
    let savedGames = this.getItem(this.keys.save) || [],
      saveData = {
        date: Date.now(),
        game: {
          id: this.$app.game.id,
          grid: this.$app.game.grid,
          stats: this.$app.game.stats,
          imageNumber: this.$app.game.imageNumber,
        },
        config: {
          columns: (this.$app.game.grid.length) ? this.$app.game.grid[0].length : 0,
          rows: this.$app.game.grid.length,
          imagesInsteadNumbers: this.$app.config.imagesInsteadNumbers,
        },
      };

    let saveInLocal = savedGames.find((save) => save.game.id === saveData.game.id) || false;

    if (saveInLocal) {
      Object.assign(saveInLocal, saveData);
    } else {
      if (savedGames.length > 7)
        savedGames.shift();

      savedGames.push(saveData);
    }

    savedGames.sort((a, b) => {
      if (a.date < b.date) {
        return -1;
      }
      return 1;
    });

    this.setItem(this.keys.save, savedGames);
  }

  saveBestGames() {
    let bestGames = this.getBestGames(),
      currentGame = {
        date: Date.now(),
        time: this.$app.game.getTimeString(),
        steps: this.$app.game.stats.steps,
      };

    if (!bestGames)
      bestGames = [];

    let position = bestGames.findIndex((item) => item.steps > currentGame.steps);

    if (position === -1)
      position = bestGames.length;

    bestGames.splice(position, 0, currentGame);

    if (bestGames.length > 10)
      bestGames.length = 10;

    this.setItem(this.keys.best, bestGames);
  }

  getBestGames() {
    return this.getItem(this.keys.best);
  }

  saveSettings() {
    this.setItem(this.keys.config, this.$app.config);
  }

  getSettings() {
    return this.getItem(this.keys.config);
  }
}