import Mixin from '../mixin';

export default class Statistics {
  constructor(app) {
    this.$app = app;

    Object.defineProperty(this, 'SORT_ASC', {
      value: 'asc',
      writable: false,
    });

    Object.defineProperty(this, 'SORT_DESC', {
      value: 'desc',
      writable: false,
    });

    this.collectionExample = {
      category: null,
      key: null,
      translation: null,
      countTrain: 0,
      countGameRight: 0,
      countGameWrong: 0,
    };
    this.collection = this.$app.storage.getStatisticsData() || this.getEmptyCollection();
    this.collectionNodes = [];
    this.sort = {
      collectionInitial: this.collectionNodes,
      collectionSorted: [],
      type: null,
      column: null,
    };

    this.keys = {
      train: 'countTrain',
      gameRight: 'countGameRight',
      gameWrong: 'countGameWrong',
    };
  }

  getEmptyCollection() {
    const out = [];

    Object.keys(this.$app.library.categories).forEach((category) => {
      out.push(...this.$app.getCategoryWords(category, true).map((word) => {
        const example = {...this.collectionExample};

        return Object.assign(example, word);
      }));
    });

    return out;
  }

  addCountByType(category, key, type) {
    if (!Object.values(this.keys).includes(type)) return;

    const wordInfo = this.collection.find((word) => word.category === category && word.key === key);

    if (wordInfo) {
      wordInfo[type] += 1;

      this.saveStatistics();
    }
  }

  saveStatistics() {
    this.$app.storage.setStatisticsData(this.collection);
  }

  sortNodes(column) {
    if (this.sort.column !== column) {
      this.sort.type = null;
    }

    this.sort.column = column;
    this.sort.type = (this.sort.type === this.SORT_DESC)
      ? this.SORT_ASC
      : (this.sort.type === this.SORT_ASC)
        ? null
        : this.SORT_DESC;

    const asc = (a, b) => (a.config[this.sort.column] > b.config[this.sort.column])
      ? -1
      : (a.config[this.sort.column] < b.config[this.sort.column])
        ? 1
        : 0;
    const desc = (a, b) => (a.config[this.sort.column] > b.config[this.sort.column])
      ? 1
      : (b.config[this.sort.column] > a.config[this.sort.column])
        ? -1
        : 0;

    this.sort.collectionSorted.length = 0;
    this.sort.collectionInitial.forEach((item) => this.sort.collectionSorted.push(item));

    if (this.sort.type) {
      this.sort.collectionSorted.sort((this.sort.type === this.SORT_ASC) ? asc : desc);
    }

    document.dispatchEvent(new Event('statistics-changed'));
  }

  resetData() {
    this.collection.forEach((item) => {
      item.countTrain = 0;
      item.countGameRight = 0;
      item.countGameWrong = 0;
    });

    this.sort.type = null;
    this.sort.column = null;
    this.sort.collectionSorted.length = 0;

    this.saveStatistics();

    document.dispatchEvent(new Event('statistics-changed'));
  }

  getDifficultWords() {
    return this.collection.slice()
      .filter((word) => word.countGameWrong)
      .sort((a, b) => {
        const percentsCurrent = Mixin.calcWordGamePercent(b);
        const percentsPrevious = Mixin.calcWordGamePercent(a);

        return (percentsCurrent.wrong < percentsPrevious.wrong) ? -1 : 1;
      })
      .slice(0, 8);
  }
}
