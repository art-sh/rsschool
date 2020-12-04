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
      document.dispatchEvent(new Event('hashchange'));
    }
  }

  setHashListener() {
    document.addEventListener('hashchange', () => {
      console.log('change');
      let category = window.location.hash.slice(2);

      if (!category) category = 'home';

      this.$view.renderPage(category);
      document.title = Mixin.uppercaseFirstLetter(category);
    });
  }
}
