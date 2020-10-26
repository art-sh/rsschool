import './style.scss';
import Menu from '../../assets/js/components/menu.js';
import Popup from '../../assets/js/components/popup.js';
import Pagination from '../../assets/js/components/pagination.js';

new Menu(document.getElementById('menu-open'));
new Popup({
  collectionItemClass: 'our-friends__content-slider-collection-item'
})
new Pagination({
  collectionBaseClass: 'our-friends__content-slider-collection',
  navFirst: 'our-friends__content-slider-nav-item--first',
  navLast: 'our-friends__content-slider-nav-item--last',
  prev: 'our-friends__content-slider-nav-item--prev',
  next: 'our-friends__content-slider-nav-item--next',
  currentPosition: 'our-friends__content-slider-nav-item--active',
});

const redirectToMain = (e) => {
  e.preventDefault();

  window.location.pathname = '/pages/main';
}

document
  .querySelector('.section-header__header-navigation-collection-item--active')
  .addEventListener('click', window.scrollTo.bind(null, {top: 0}));

document
  .querySelector('.redirect-main')
  .addEventListener('click', redirectToMain);

document
  .querySelector('.section-header__header-content')
  .addEventListener('click', redirectToMain);