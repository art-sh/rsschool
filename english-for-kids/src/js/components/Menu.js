import Mixin from '../mixin';

export default class Menu {
  constructor(app) {
    this.$app = app;

    this.isShown = false;

    this.elements = {
      container: {
        class: 'menu',
        el: null,
      },
      button: {
        container: {
          class: 'menu__toggle',
          el: null,
        },
        icon: {
          class: 'menu__toggle-icon',
          template: `<img class="menu__toggle-icon-image" src="${this.$app.imagesMap['menu/button.svg']}" alt="menu">`,
          click: this.show.bind(this),
          el: null,
        },
      },
      background: {
        class: 'menu__background',
        click: this.hide.bind(this),
        el: null,
      },
      collection: {
        container: {
          class: 'menu__collection',
          tag: 'ul',
          el: null,
        },
        close: {
          container: {
            class: 'menu__collection-item',
            tag: 'li',
            click: this.hide.bind(this),
            el: null,
          },
          icon: {
            class: 'menu__collection-item-icon menu__collection-item-icon--close',
            template: `<img src="${this.$app.imagesMap['menu/close.svg']}" alt="menu">`,
            el: null,
          },
        },
        item: {
          skip: true,
          container: {
            class: 'menu__collection-item',
          },
          icon: {
            class: 'menu__collection-item-icon',
          },
          text: {
            class: 'menu__collection-item-text',
          },
        },
      },
    };
    this.collectionElements = {};
  }

  init() {
    this.buildMenu();
  }

  getElements() {
    return this.elements;
  }

  buildMenu() {
    this.$app.appendToContainer(Mixin.getElementsByConfig(this.elements));

    this.buildMenuCollection();
    this.setMenuListeners();
  }

  buildMenuCollection() {
    ['home', 'statistics'].concat(Object.keys(this.$app.library.categories)).forEach((category) => {
      const menuItem = document.createElement('li');
      const menuItemIcon = document.createElement('figure');
      const menuItemIconImg = document.createElement('img');
      const menuItemText = document.createElement('div');

      menuItemIconImg.src = this.$app.imagesMap[`menu/${category}.svg`];
      menuItemIconImg.alt = category;

      menuItemText.innerText = Mixin.uppercaseFirstLetter(category);

      menuItem.addEventListener('click', () => {
        this.$app.router.navigate((category === 'home') ? '' : `category/${category}`);
        this.hide();
      });

      menuItem.className = this.elements.collection.item.container.class;
      menuItemIcon.className = this.elements.collection.item.icon.class;
      menuItemText.className = this.elements.collection.item.text.class;

      menuItem.append(menuItemIcon);
      menuItem.append(menuItemText);
      menuItemIcon.append(menuItemIconImg);

      this.elements.collection.container.el.append(menuItem);
      this.collectionElements[category] = menuItem;
    });
  }

  show() {
    this.isShown = true;
    this.$app.containerClassAdd('menu-show');
  }

  hide() {
    this.isShown = false;
    this.$app.containerClassRemove('menu-show');
  }

  setMenuListeners() {
    document.addEventListener('route-change', () => {
      Array.from(this.elements.collection.container.el.children).forEach((node) => node.classList.remove('active'));
      const {currentRoute} = this.$app.router;

      if (currentRoute === '') {
        this.collectionElements.home.classList.add('active');
      } else if (currentRoute === 'statistics') {
        this.collectionElements.statistics.classList.add('active');
      } else if (currentRoute.includes('category')) {
        this.collectionElements[currentRoute.split('/').pop()].classList.add('active');
      }
    });
  }
}
