import pets from '../config.json';

export default class Popup {
  constructor(props) {
    this.popup = this.buildPopup();
    this.collectionItemClass = props.collectionItemClass;

    this.setListeners();
  }

  showPopup(petName) {
    this.loadPopupInfo(petName);
    this.popup.container.classList.add('active');
    document.body.classList.add('lock-scroll');
  }

  hidePopup() {
    this.popup.container.classList.remove('active');
    document.body.classList.remove('lock-scroll');
  }

  loadPopupInfo(petName) {
    let config = pets.filter((item) => item.name === petName)[0],
      content = this.popup.content;

    content.image.src = config.img;
    content.image.alt = config.name;
    content.name.innerText = config.name;
    content.type.innerText = `${config.type} - ${config.breed}`;
    content.description.innerText = config.description;
    content.extra.age.innerText = config.age;
    content.extra.inoculations.innerText = config.inoculations.join(', ');
    content.extra.diseases.innerText = config.diseases.join(', ');
    content.extra.parasites.innerText = config.parasites.join(', ');
  }

  buildPopup() {
    let popup = {
      container: null,
      background: null,
      close: null,
      content: {
        image: null,
        name: null,
        type: null,
        description: null,
        extra: {
          age: null,
          inoculations: null,
          diseases: null,
          parasites: null,
        }
      }
    };

    popup.container = document.createElement('div');
    popup.container.className = 'popup';
    popup.container.innerHTML =
      `<div class="popup__background"></div>
      <div class="popup__close"></div>
      <div class="popup__content">
        <figure class="popup__content-image">
            <img class="popup__content-image-img" src='#' alt="">
        </figure>
        <div class="popup__content-block">
          <div class="popup__content-block-name"></div>
          <div class="popup__content-block-type"></div>
          <div class="popup__content-block-description"></div>
          <ul class="popup__content-block-extra">
            <li class="popup__content-block-extra-item">
              <i class="popup__content-block-extra-item-icon"></i>
              <span class="popup__content-block-extra-item-text">
                <b>Age:</b>
                <span class="popup__content-block-extra-item-text--age"></span>
              </span>
            </li>
            <li class="popup__content-block-extra-item">
              <i class="popup__content-block-extra-item-icon"></i>
              <span class="popup__content-block-extra-item-text">
                <b>Inoculations:</b>
                <span class="popup__content-block-extra-item-text--inoculations"></span>
              </span>
            </li>
            <li class="popup__content-block-extra-item">
              <i class="popup__content-block-extra-item-icon"></i>
              <span class="popup__content-block-extra-item-text">
                <b>Diseases:</b>
                <span class="popup__content-block-extra-item-text--diseases"></span>
              </span>
            </li>
            <li class="popup__content-block-extra-item">
              <i class="popup__content-block-extra-item-icon"></i>
              <span class="popup__content-block-extra-item-text">
                <b>Parasites:</b>
                <span class="popup__content-block-extra-item-text--parasites"></span>
              </span>
            </li>
          </ul>
        </div>
      </div>`;
    popup.background = popup.container.querySelector('.popup__background');
    popup.close = popup.container.querySelector('.popup__close');
    popup.content.image = popup.container.querySelector('.popup__content-image-img');
    popup.content.name = popup.container.querySelector('.popup__content-block-name');
    popup.content.type = popup.container.querySelector('.popup__content-block-type');
    popup.content.description = popup.container.querySelector('.popup__content-block-description');
    popup.content.extra.age = popup.container.querySelector('.popup__content-block-extra-item-text--age');
    popup.content.extra.inoculations = popup.container.querySelector('.popup__content-block-extra-item-text--inoculations');
    popup.content.extra.diseases = popup.container.querySelector('.popup__content-block-extra-item-text--diseases');
    popup.content.extra.parasites = popup.container.querySelector('.popup__content-block-extra-item-text--parasites');

    document.body.append(popup.container);

    return popup;
  }

  setListeners() {
    this.popup.background.addEventListener('click', this.hidePopup.bind(this));
    this.popup.background.addEventListener('touchmove', (e) => e.preventDefault());
    this.popup.background.addEventListener('scroll', (e) => e.preventDefault());
    this.popup.close.addEventListener('click', this.hidePopup.bind(this));

    document.body.addEventListener('click', (e) => {
      let collectionItem = e.target.closest(`.${this.collectionItemClass}`);

      if (!collectionItem)
        return;

      e.preventDefault();

      this.showPopup(collectionItem.dataset.item);
    });
  }
}