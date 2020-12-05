import Mixin from '../mixin';
import Game from './Game';

export default class View {
  constructor(app) {
    this.$app = app;
    this.$game = null;

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
          pageName: {
            class: 'view__content-header-page-name',
            el: null,
          },
          mode: {
            container: {
              class: 'view__content-header-mode',
              el: null,
            },
            train: {
              class: 'view__content-header-mode-button view__content-header-mode-button--train',
              text: 'Train',
              el: null,
            },
            separator: {
              class: 'view__content-header-mode-separator',
              text: '/',
              el: null,
            },
            play: {
              class: 'view__content-header-mode-button view__content-header-mode-button--play',
              text: 'Play',
              el: null,
            },
          },
          game: {
            container: {
              class: 'view__content-header-game',
              el: null,
            },
            start: {
              class: 'view__content-header-game-button',
              text: 'Start',
              el: null,
            },
            repeat: {
              class: 'view__content-header-game-button',
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
          item: {
            skip: true,
            class: 'view__content-stats-item',
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
        popup: {
          container: {
            class: 'view__popup',
          },
        },
      },
    };
    this.wordsCollection = {};
  }

  init() {
    this.buildContainer();
    this.setViewListeners();

    this.$game = new Game(this.$app, this);
  }

  getElements() {
    return this.elements;
  }

  buildContainer() {
    this.$app.appendToContainer(Mixin.getElementsByConfig(this.elements, true));
  }

  renderPage(category) {
    this.elements.content.header.pageName.el.innerText = Mixin.uppercaseFirstLetter(category);
    this.wordsCollection = {};

    this.elements.content.cards.container.el.ontransitionend = (e) => {
      if (e.target !== this.elements.content.cards.container.el) {
        return;
      }

      this.elements.content.cards.container.el.ontransitionend = null;
      this.elements.content.cards.container.el.innerHTML = '';

      if (category === 'home') {
        this.renderHomeView();
      } else {
        this.$app.loadSoundsByCategory(category);
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
      cardFront.addEventListener('click', () => {
        if (card.classList.contains('inactive')) return;

        if (this.$game.currentMode === this.$game.MODE_PLAY) {
          this.$game.validateAnswer(config.key);
        } else {
          this.$app.playSound(category, config.key);
        }
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

      this.wordsCollection[config.key] = card;
    } else {
      card.addEventListener('click', () => {
        this.$app.router.navigate(`category/${config.key}`);
      });
    }

    return card;
  }

  setViewListeners() {
    document.addEventListener('route-change', () => {
      const category = this.$app.router.currentRoute.split('/').pop();

      if (category) {
        this.$app.containerClassAdd('route-category');
      } else {
        this.$app.containerClassRemove('route-category');
      }
    });
  }
}
