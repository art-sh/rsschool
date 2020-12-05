import Mixin from '../mixin';

export default class Router {
  constructor(app, view) {
    this.$app = app;
    this.$view = view;

    this.currentRoute = null;

    this.setHashListener();
  }

  navigate(newRoute, force = false) {
    window.location.hash = `#/${(newRoute !== 'home') ? newRoute : ''}`;

    if (force) {
      window.dispatchEvent(new Event('hashchange'));
    }
  }

  setHashListener() {
    window.addEventListener('hashchange', () => {
      this.currentRoute = window.location.hash.slice(2);
      let category = this.currentRoute;

      if (!category) category = 'home';

      if (this.currentRoute.search('category') !== -1) [category] = this.currentRoute.split('/').reverse();

      this.$view.renderPage(category);
      document.title = Mixin.uppercaseFirstLetter(category);

      document.dispatchEvent(new Event('route-change'));
    });
  }
}
