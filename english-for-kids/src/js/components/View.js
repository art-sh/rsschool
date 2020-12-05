import Mixin from '../mixin';

export default class View {
  constructor(app) {
    this.$app = app;

    this.elements = {
      container: {
        class: 'view',
        el: null,
      },
      content: {
        container: {
          class: 'view__content',
          el: null,
        },
        header: {
          container: {
            class: 'view__content-header',
            el: null,
          },
          actions: {
            container: {
              class: 'view__content-actions',
              el: null,
            },
          },
          pageName: {
            class: 'view__content-header-page-name',
            el: null,
          },
          buttons: {
            container: {
              class: 'view__content-buttons',
              el: null,
            },
            play: {
              class: 'view__content-buttons-play',
              text: 'Play',
              el: null,
            },
            repeat: {
              class: 'view__content-buttons-repeat',
              text: 'Repeat',
              el: null,
            },
          },
        },
        gameStats: {
          container: {
            class: 'view__content-stats',
            el: null,
          },
        },
        cards: {
          container: {
            class: 'view__content-cards',
            el: null,
          },
          item: {
            skip: true,
            container: 'view__content-cards-item',
            inner: 'view__content-cards-item-inner',
            front: {
              container: 'view__content-cards-item-inner-front',
              image: 'view__content-cards-item-inner-front-image',
              footer: {
                container: 'view__content-cards-item-inner-front-footer',
                word: 'view__content-cards-item-inner-front-footer-translation',
                button: 'view__content-cards-item-inner-front-footer-button',
              },
            },
            back: 'view__content-cards-item-inner-back',
          },
        },
      },
      home: {
        skip: true,
        container: {
          class: 'view__container',
        },
      },
    };
  }

  init() {
    this.buildContainer();
  }

  buildContainer() {
    this.$app.appendToContainer(Mixin.getElementsByConfig(this.elements, true));
  }

  renderPage(category) {
    this.elements.content.header.pageName.el.innerText = Mixin.uppercaseFirstLetter(category);

    this.elements.content.cards.container.el.ontransitionend = (e) => {
      if (e.target !== this.elements.content.cards.container.el) {
        return;
      }

      this.elements.content.cards.container.el.ontransitionend = null;
      this.elements.content.cards.container.el.innerHTML = '';
      console.log('scale', e.target);

      console.log(category);
      if (category === 'home') {
        this.renderHomeView();
      } else {
        this.renderCategory(category);
      }

      this.elements.content.cards.container.el.removeAttribute('style');
    };

    setTimeout(() => {
      this.elements.content.cards.container.el.removeAttribute('style');

      this.elements.content.cards.container.el.style.pointerEvents = 'none';
      this.elements.content.cards.container.el.style.opacity = '0';
      this.elements.content.cards.container.el.style.transform = 'scale(0)';
    });
  }

  renderHomeView() {
    const categories = Object.keys(this.$app.library.categories);

    categories.forEach((category) => {
      this.elements.content.cards.container.el.append(this.getCard('home', {key: category}));
    });
  }

  renderCategory(category) {
    const words = this.$app.library.categories[category];

    if (words) {
      words.forEach((word) => {
        this.elements.content.cards.container.el.append(this.getCard(category, word));
      });
    }
  }

  getCard(category, config) {
    console.log(config);
    const useFlip = category !== 'home';
    const imageName = (useFlip)
      ? `category/${category}/${config.key}.jpg`
      : `home/${config.key}.jpg`;

    const card = document.createElement('div');
    const cardInner = document.createElement('div');
    const cardFront = document.createElement('div');
    const cardFrontImage = document.createElement('div');
    const cardFrontFooter = document.createElement('div');
    const cardFrontFooterWord = document.createElement('div');
    const cardFrontFooterButton = document.createElement('div');
    const cardTranslation = document.createElement('div');

    card.className = this.elements.content.cards.item.container;
    cardInner.className = this.elements.content.cards.item.inner;
    cardFront.className = this.elements.content.cards.item.front.container;
    cardFrontImage.className = this.elements.content.cards.item.front.image;
    cardFrontFooter.className = this.elements.content.cards.item.front.footer.container;
    cardFrontFooterWord.className = this.elements.content.cards.item.front.footer.word;
    cardFrontFooterButton.className = this.elements.content.cards.item.front.footer.button;
    cardTranslation.className = this.elements.content.cards.item.back;

    cardFrontFooterWord.innerText = Mixin.uppercaseFirstLetter(config.key);
    cardFrontImage.style.backgroundImage = `url(${this.$app.imagesMap[imageName]})`;
    cardTranslation.innerText = (config.translation) ? Mixin.uppercaseFirstLetter(config.translation) : '';

    if (useFlip) {
      card.addEventListener('click', () => {
        this.$app.playSound(config.key);
      });

      cardFrontFooterButton.addEventListener('click', (e) => {
        e.stopPropagation();
        card.classList.add('available');

        card.onmouseleave = () => {
          card.mouseleave = null;
          card.classList.remove('available');
        };
      });
    }

    card.append(cardInner);
    cardInner.append(cardFront);
    cardFront.append(cardFrontImage);
    cardFront.append(cardFrontFooter);
    cardFrontFooter.append(cardFrontFooterWord);
    cardInner.append(cardTranslation);

    if (useFlip) {
      cardFrontFooter.append(cardFrontFooterButton);
    } else {
      card.addEventListener('click', () => {
        console.log(config.key);
        this.$app.router.navigate(`category/${config.key}`);
      });
    }

    return card;
  }
}
