import pets from '../config.json';

export default class Pagination {
  constructor(props) {
    this.arrays = this.generateArray();

    this.collectionBaseClass = props.collectionBaseClass;
    this.collectionElement = document.querySelector(`.${props.collectionBaseClass}`);
    this.navFirst = document.querySelector(`.${props.navFirst}`);
    this.navLast = document.querySelector(`.${props.navLast}`);
    this.navPrev = document.querySelector(`.${props.prev}`);
    this.navNext = document.querySelector(`.${props.next}`);
    this.currentPosition = document.querySelector(`.${props.currentPosition}`);

    this.setListeners();
    window.dispatchEvent(new Event('resize'));
  }

  get currentIndex() {
    return this.currentIndexReal || 0;
  }

  set currentIndex(val) {
    if (this.isChangingSlide)
      return;

    this.currentIndexReal = val;

    this.displaySlide();
  }

  generateArray() {
    let out = {
      eight: [],
      six: [],
      three: [],
    }

    out.eight = this.generateArrayByCount(pets, 8, 48 / 8);
    out.six = this.generateArrayByCount(pets, 6, 48 / 6);
    out.three = this.generateArrayByCount(pets, 3, 48 / 3);

    return out;
  }

  generateArrayByCount(arr, countInArray, overallArray) {
    arr = JSON.parse(JSON.stringify(arr));

    let out = [],
      overallArrayCount = 0,
      unique = arr.reduce((out, item) => {
        let obj = {};

        obj.name = item.name;
        obj.count = 0;

        out.push(obj);

        return out;
      }, []);

    while (overallArrayCount < overallArray) {
      let itemOut = [];

      while (itemOut.length !== countInArray) {
        let uniqueRebuild = unique.sort(() => Math.random() - 0.5);
        let minName = unique.filter((item) => item.count === Math.min(...uniqueRebuild.reduce((out, item) => {
          out.push(item.count);

          return out;
        }, [])))[0].name;

        let item = arr.filter((item) => item.name === minName)[0];

        if (this.isInArray(itemOut, item))
          continue;

        unique.forEach((item) => {
          if (item.name === minName)
            item.count++;
        });

        itemOut.push(item);
      }

      out.push(itemOut);
      overallArrayCount++;
    }

    return out;
  }

  isInArray(arr, itemCheck) {
    return !!arr.filter((item) => item.name === itemCheck.name).length;
  }

  setListeners() {
    const resizeHandler = () => {
      let timeout = null;

      return () => {
        if (timeout) {
          clearTimeout(timeout);

          timeout = null;
        }

        timeout = setTimeout(() => {
          let currentSet = (window.innerWidth < 768)
            ? 'three'
            : (window.innerWidth < 1280)
              ? 'six'
              : 'eight';

          if (this.currentSet !== currentSet) {
            this.currentSet = currentSet;
            this.currentIndex = 0;
          }
        }, 0);
      }
    }

    window.addEventListener('resize', resizeHandler.call(this));

    this.navFirst.addEventListener('click', () => {
      if (this.currentIndex)
        this.currentIndex = 0;
    });
    this.navLast.addEventListener('click', () => {
      if (this.currentIndex !== this.arrays[this.currentSet].length - 1)
        this.currentIndex = this.arrays[this.currentSet].length - 1
    });
    this.navPrev.addEventListener('click', () => this.currentIndex && this.currentIndex--);
    this.navNext.addEventListener('click', () => (this.currentIndex < this.arrays[this.currentSet].length - 1) && this.currentIndex++);
  }

  displaySlide() {
    let dataSet = this.arrays[this.currentSet][this.currentIndex];

    this.isChangingSlide = true;
    document.body.classList.add('loading');

    setTimeout(() => {
      this.currentPosition.innerText = this.currentIndex + 1;
      this.collectionElement.innerHTML = '';

      dataSet.forEach((config) => this.collectionElement.append(this.getSlideElement(config)));

      this.handleNavClasses();

      setTimeout(() => {
        document.body.classList.remove('loading');
        this.isChangingSlide = false;
      }, 0);
    }, 250);
  }

  getSlideElement(config) {
    let element = document.createElement('div');
    element.className = `${this.collectionBaseClass}-item`;
    element.dataset.item = config.name;
    element.innerHTML =
      `<figure class="our-friends__content-slider-collection-item-image">
        <img src="${config.img}" alt="${config.name}">
      </figure>
      <div class="our-friends__content-slider-collection-item-description">
        <div class="our-friends__content-slider-collection-item-description-name">${config.name}</div>
        <a href="#" class="our-friends__content-slider-collection-item-description-button">Learn more</a>
      </div>`;

    return element;
  }

  handleNavClasses() {
    let inactiveClass = 'our-friends__content-slider-nav-item--inactive';

    if (!this.currentIndex) {
      this.navFirst.classList.add(inactiveClass);
      this.navPrev.classList.add(inactiveClass);
      this.navFirst.setAttribute('disabled', 'true');
      this.navPrev.setAttribute('disabled', 'true');

      this.navNext.classList.remove(inactiveClass);
      this.navLast.classList.remove(inactiveClass);
      this.navNext.removeAttribute('disabled');
      this.navLast.removeAttribute('disabled');
    } else if (this.currentIndex === this.arrays[this.currentSet].length - 1) {
      this.navFirst.classList.remove(inactiveClass);
      this.navPrev.classList.remove(inactiveClass);
      this.navFirst.removeAttribute('disabled');
      this.navPrev.removeAttribute('disabled');

      this.navNext.classList.add(inactiveClass);
      this.navLast.classList.add(inactiveClass);
      this.navNext.setAttribute('disabled', 'true');
      this.navLast.setAttribute('disabled', 'true');
    } else if (this.currentIndex) {
      this.navFirst.classList.remove(inactiveClass);
      this.navPrev.classList.remove(inactiveClass);
      this.navNext.classList.remove(inactiveClass);
      this.navLast.classList.remove(inactiveClass);

      this.navFirst.removeAttribute('disabled');
      this.navPrev.removeAttribute('disabled');
      this.navNext.removeAttribute('disabled');
      this.navLast.removeAttribute('disabled');
    }
  }
}