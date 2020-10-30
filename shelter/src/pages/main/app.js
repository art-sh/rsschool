import './style.scss';
import Menu from '../../assets/js/components/menu.js';
import Slider from '../../assets/js/components/slider.js';
import Popup from '../../assets/js/components/popup.js';
import Redirects from '../../assets/js/redirects.js';

new Menu(document.getElementById('menu-open'));
new Slider({
  collectionBaseClass: 'section-our-friends__content-slider-collection',
  buttons: document.querySelectorAll('.section-our-friends__content-slider-nav-button')
});
new Popup({
  collectionItemClass: 'section-our-friends__content-slider-collection-item',
});

const redirectToPets = (e) => {
  e.preventDefault();

  Redirects.pets();
}

document
  .querySelector('.section-not-only__header-navigation-collection-item--active')
  .addEventListener('click', window.scrollTo.bind(null, {top: 0}));

document
  .querySelector('.section-not-only__content-block-link')
  .addEventListener('click', redirectToPets);

document
  .querySelector('.section-our-friends__content-link')
  .addEventListener('click', redirectToPets);

document
  .querySelector('.redirect-pets')
  .addEventListener('click', redirectToPets);
