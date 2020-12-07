import Mixin from '../mixin';

export default class Storage {
  constructor(app) {
    this.$app = app;

    this.keys = {
      statistics: '__statistics',
    };
  }

  getItem(key) {
    return Mixin.jsonParse(localStorage.getItem(key));
  }

  setItem(key, value) {
    localStorage.setItem(key, Mixin.jsonEncode(value));
  }

  getStatisticsData() {
    return this.getItem(this.keys.statistics);
  }

  setStatisticsData(data) {
    this.setItem(this.keys.statistics, data);
  }
}
