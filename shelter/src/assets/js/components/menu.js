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

  menuToggle(e) {
    if (e.target.classList.contains('click-ignore'))
      return;

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
          <a class="menu__container-block-navigation-collection-item-link"
            href="${this.getLinkPath('pages/main')}"
            onclick="Menu.isCurrentPage('pages/main') && Menu.scrollTop()"
            >About the shelter</a>
        </li>
        <li class="menu__container-block-navigation-collection-item ${this.getItemActiveClass('pages/our-pets')}">
          <a class="menu__container-block-navigation-collection-item-link"
            href="${this.getLinkPath('pages/our-pets')}"
            onclick="Menu.isCurrentPage('pages/main') && Menu.scrollTop()"
            >Our pets</a>
        </li>
        <li class="menu__container-block-navigation-collection-item">
          <a class="menu__container-block-navigation-collection-item-link click-ignore" href="#">Help the shelter</a>
        </li>
        <li class="menu__container-block-navigation-collection-item">
          <a class="menu__container-block-navigation-collection-item-link click-ignore" href="#">Contacts</a>
        </li>
      </ul>`;
    menuNavigation
      .querySelectorAll('.menu__container-block-navigation-collection-item')
      .forEach((link) => link.addEventListener('click', this.menuToggle.bind(this)));


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

  getLinkPath(page) {
    return this.isCurrentPage(page) ? '#' : `../../${page}`;
  }

  scrollTop() {
    window.scrollTo({top: 0});
  }
}