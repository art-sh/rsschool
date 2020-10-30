import Redirects from '../redirects.js';

export default class Menu {
  constructor(button) {
    this.buttonElement = button;
    this.menuElement = this.createMenu();
    this.isOpen = false;

    this.setListener(button);
  }

  setListener(button) {
    button.addEventListener('click', this.menuToggle.bind(this));
  }

  menuToggle() {
    let action = this.isOpen ? 'remove' : 'add';

    this.buttonElement.classList[action]('menu-open');
    this.menuElement.classList[action]('active');
    document.body.classList[action]('menu-open');
    document.body.classList[action]('lock-scroll');

    this.isOpen = !this.isOpen;
  }

  createMenu() {
    window.Menu = this;

    let menuWrapper = document.createElement('div');
    menuWrapper.classList.add('menu__container');

    let menuBackground = document.createElement('div');
    menuBackground.classList.add('menu__container-background');
    menuBackground.addEventListener('click', this.menuToggle.bind(this));

    let menuContent = document.createElement('div');
    menuContent.classList.add('menu__container-block');

    let menuNavigation = document.createElement('div');
    menuNavigation.classList.add('menu__container-block-navigation');
    menuNavigation.innerHTML =
      `<ul class="menu__container-block-navigation-collection">
        <li
          class="menu__container-block-navigation-collection-item ${this.getItemActiveClass('pages/main')}">
          <a class="menu__container-block-navigation-collection-item-link" href="#"
            onclick="Menu.handleMenuItemClick.call(Menu, 'pages/main', 'main')"
            >About the shelter</a>
        </li>
        <li class="menu__container-block-navigation-collection-item ${this.getItemActiveClass('pages/our-pets')}">
          <a class="menu__container-block-navigation-collection-item-link" href="#"
            onclick="Menu.handleMenuItemClick.call(Menu, 'pages/our-pets', 'pets')"
            >Our pets</a>
        </li>
        <li class="menu__container-block-navigation-collection-item">
          <a class="menu__container-block-navigation-collection-item-link click-ignore" href="#">Help the shelter</a>
        </li>
        <li class="menu__container-block-navigation-collection-item">
          <a class="menu__container-block-navigation-collection-item-link click-ignore" href="#">Contacts</a>
        </li>
      </ul>`;


    menuContent.append(menuNavigation);

    menuWrapper.append(menuBackground);
    menuWrapper.append(menuContent);

    document.body.append(menuWrapper);

    return menuWrapper;
  }

  isCurrentPage(page) {
    return window.location.pathname.search(page) !== -1;
  }

  getItemActiveClass(page) {
    return this.isCurrentPage(page)
      ? 'menu__container-block-navigation-collection-item--active'
      : '';
  }

  handleMenuItemClick(page, pageToRedirect) {
    if (!this.isCurrentPage(page)) {
      Redirects[pageToRedirect]();

      return;
    }

    this.scrollTop();
    this.menuToggle();
  }

  scrollTop() {
    window.scrollTo({top: 0});
  }
}