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
                translation: 'view__content-cards-item-inner-front-footer-translation',
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
    this.elements.content.cards.container.el.innerHTML = '';
    this.elements.content.header.pageName.el.innerText = Mixin.uppercaseFirstLetter(category);

    console.log(category);
    this.renderHomeView();
  }

  renderHomeView() {
    const categories = Object.keys(this.$app.library.categories);

    categories.forEach((category) => {
      this.elements.content.cards.container.el.append(this.getCard({key: category}));
    });
  }

  getCard(config, useBack = false) {
    console.log(config, useBack);
    const imageName = `home/${config.key}.jpg`;

    const card = document.createElement('div');
    const cardInner = document.createElement('div');
    const cardFront = document.createElement('div');
    const cardFrontImage = document.createElement('div');
    const cardFrontFooter = document.createElement('div');
    const cardFrontFooterTranslation = document.createElement('div');
    const cardFrontFooterButton = document.createElement('div');
    const cardBack = document.createElement('div');

    card.className = this.elements.content.cards.item.container;
    cardInner.className = this.elements.content.cards.item.inner;
    cardFront.className = this.elements.content.cards.item.front.container;
    cardFrontImage.className = this.elements.content.cards.item.front.image;
    cardFrontFooter.className = this.elements.content.cards.item.front.footer.container;
    cardFrontFooterTranslation.className = this.elements.content.cards.item.front.footer.translation;
    cardFrontFooterButton.className = this.elements.content.cards.item.front.footer.button;
    cardBack.className = this.elements.content.cards.item.back;

    cardFrontFooterTranslation.innerText = Mixin.uppercaseFirstLetter(config.key);
    cardFrontImage.style.backgroundImage = `url(${this.$app.imagesMap[imageName]})`;

    card.append(cardInner);
    cardInner.append(cardFront);
    cardFront.append(cardFrontImage);
    cardFront.append(cardFrontFooter);
    cardFrontFooter.append(cardFrontFooterTranslation);

    if (useBack) {
      cardInner.append(cardBack);
      cardFrontFooter.append(cardFrontFooterButton);
    } else {
      card.addEventListener('click', () => {
        console.log(config.key);
        this.$app.router.navigate(config.key);
      });
    }

    return card;
  }
}
