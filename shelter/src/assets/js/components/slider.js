import pets from '../config.json';

export default class Slider {
  constructor(props) {
    this.collection = document.querySelector(`.${props.collectionBaseClass}`);
    this.collectionBaseClass = props.collectionBaseClass;

    this.setListener(props.buttons);
  }

  setListener(buttons) {
    buttons.forEach((item) => item.addEventListener('click', this.changeSlide.bind(this)));
  }

  changeSlide() {
    this.collection.classList.add('loading');

    setTimeout(() => {
      this.genNewCollection();
      this.collection.innerHTML = '';

      this.currentCollection.forEach((config) => this.collection.append(this.generateNewItem(config)));

      setTimeout(() => this.collection.classList.remove('loading'), 0);
    }, 250);
  }

  generateNewItem(config) {
    let elem = document.createElement('div');

    elem.className = `${this.collectionBaseClass}-item`;
    elem.dataset.item = config.name;
    elem.innerHTML =
      `<figure class="${this.collectionBaseClass}-item-image">
        <img src="${config.img}" alt="${config.name.toLowerCase()}">
      </figure>
      <div class="${this.collectionBaseClass}-item-description">
        <h2 class="${this.collectionBaseClass}-item-description-name">${config.name}</h2>
        <a class="${this.collectionBaseClass}-item-description-button" href="#">Learn more</a>
      </div>`;

    return elem;
  }

  genNewCollection() {
    let currentPets = (this.currentCollection || []).reduce((out, slide) => {
      out.push(slide.name);

      return out;
    }, []);

    this.currentCollection = pets
      .filter((pet) => !currentPets.includes(pet.name))
      .sort(() => Math.random() - 0.5)
      .slice(0, this.getCountOfSlides());

    return this.currentCollection;
  }

  getCountOfSlides() {
    return 3;
  }
}