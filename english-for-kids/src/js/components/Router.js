import Mixin from '../mixin';

export default class Router {
  constructor(app, view) {
    this.$app = app;
    this.$view = view;

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
      const route = window.location.hash.slice(2);
      let category = route;
      console.log('change', route);

      if (!category) category = 'home';

      if (route.search('category') !== -1) [category] = route.split('/').reverse();

      this.$view.renderPage(category);
      document.title = Mixin.uppercaseFirstLetter(category);
    });
  }
}
