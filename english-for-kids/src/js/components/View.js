import Mixin from '../mixin';
import Game from './Game';
import Statistics from './Statistics';

export default class View {
  constructor(app) {
    this.$app = app;
    this.$game = null;
    this.$statistics = null;

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
            game: {
              container: {
                class: 'view__content-header-mode-game',
                el: null,
              },
              train: {
                class: 'view__content-header-mode-game-button view__content-header-mode-game-button--train',
                text: 'Train',
                click: () => this.$game.toggleTrain(),
                el: null,
              },
              separator: {
                class: 'view__content-header-mode-game-separator',
                text: '/',
                el: null,
              },
              play: {
                class: 'view__content-header-mode-game-button view__content-header-mode-game-button--play',
                text: 'Play',
                click: () => this.$game.toggleGame(),
                el: null,
              },
            },
            statistics: {
              container: {
                class: 'view__content-header-mode-statistics',
                el: null,
              },
              difficult: {
                class: 'view__content-header-mode-statistics-button',
                text: 'Repeat difficult words',
                click: () => this.$app.router.navigate('difficult'),
                el: null,
              },
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
              click: () => this.$game.startGame(),
              el: null,
            },
            repeat: {
              class: 'view__content-header-game-button',
              text: 'Repeat',
              click: () => this.$game.sayCurrentWord(),
              el: null,
            },
            reset: {
              class: 'view__content-header-game-button',
              text: 'Reset',
              click: () => this.$statistics.resetData(),
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
          table: {
            skip: true,
            container: 'view__content-cards-table',
            header: {
              container: 'view__content-cards-table-header',
              cell: {
                container: 'view__content-cards-table-header-cell',
                text: 'view__content-cards-table-header-cell-text',
                sort: 'view__content-cards-table-header-cell-sort',
              },
            },
            row: {
              container: 'view__content-cards-table-row',
              cell: 'view__content-cards-table-row-cell',
            },
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

    this.$statistics = new Statistics(this.$app);
    this.$game = new Game(this.$app, this, this.$statistics);
  }

  getElements() {
    return this.elements;
  }

  buildContainer() {
    this.$app.appendToContainer(Mixin.getElementsByConfig(this.elements, true));
  }

  renderPage(route) {
    this.elements.content.header.pageName.el.innerText = Mixin.uppercaseFirstLetter(route.split('/').pop());
    this.wordsCollection = {};

    this.elements.content.cards.container.el.ontransitionend = (e) => {
      if (e.target !== this.elements.content.cards.container.el) {
        return;
      }

      this.elements.content.cards.container.el.ontransitionend = null;
      this.elements.content.cards.container.el.innerHTML = '';

      if (route === 'home') {
        this.renderHomeView();
      } else if (route === 'statistics') {
        this.renderStatistics();
      } else if (route === 'difficult') {
        this.renderDifficult();
      } else if (route.includes('category') && Object.keys(this.$app.library.categories).includes(route.split('/').pop())) {
        this.renderCategory(route.split('/').pop());
      } else {
        this.$app.router.navigate('home');
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
    const words = this.$app.getCategoryWords(category, true);

    words.length && words.forEach((word) => {
      this.elements.content.cards.container.el.append(this.getCard(word.category, word));
    });
  }

  renderDifficult() {
    const wrongWords = this.$statistics.getDifficultWords();

    wrongWords.forEach((word) => {
      this.elements.content.cards.container.el.append(this.getCard(word.category, word));
    });
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

        if (this.$game.isActive) {
          this.$game.validateAnswer(config.key);
        } else if (this.$game.currentMode === this.$game.MODE_TRAIN) {
          this.$app.playSound(category, config.key);

          this.$statistics.addCountByType(category, config.key, this.$statistics.keys.train);
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

  renderStatistics() {
    const table = document.createElement('table');
    table.classList.add(this.elements.content.cards.table.container);

    this.$statistics.collectionNodes.length = 0;

    table.append(this.getStatisticsHeader());
    this.$statistics.collection.forEach((statisticsItem) => table.append(this.getStatisticsRow(statisticsItem)));

    const statisticChange = () => {
      Array.from(table.children).forEach((node, index) => index && node.remove());

      if (!this.$statistics.sort.collectionSorted.length) {
        document.dispatchEvent(new Event('statistics-destroy'));

        this.renderStatistics();
      } else {
        this.$statistics.sort.collectionSorted.forEach((item) => table.append(item.el));
      }
    };

    document.addEventListener('statistics-changed', statisticChange);
    document.addEventListener('statistics-destroy', () => {
      table.remove();

      document.removeEventListener('statistics-changed', statisticChange);
    });

    this.elements.content.cards.container.el.append(table);
  }

  getStatisticsHeader() {
    const row = document.createElement('tr');
    const cellCategory = document.createElement('th');
    const cellWord = document.createElement('th');
    const cellTranslation = document.createElement('th');
    const cellTrain = document.createElement('th');
    const cellGameRight = document.createElement('th');
    const cellGameWrong = document.createElement('th');

    const cellsCollection = [cellCategory, cellWord, cellTranslation, cellTrain, cellGameRight, cellGameWrong];

    cellCategory.innerText = 'Category';
    cellWord.innerText = 'Word';
    cellTranslation.innerText = 'Translation';
    cellTrain.innerText = 'Count train';
    cellGameRight.innerText = 'Count game right';
    cellGameWrong.innerText = 'Count game wrong';

    cellCategory.dataset.sort = 'category';
    cellWord.dataset.sort = 'key';
    cellTranslation.dataset.sort = 'translation';
    cellTrain.dataset.sort = 'countTrain';
    cellGameRight.dataset.sort = 'countGameRight';
    cellGameWrong.dataset.sort = 'countGameWrong';

    cellsCollection.forEach((cell) => {
      cell.classList.add(this.elements.content.cards.table.header.cell.container);

      const sortButton = document.createElement('div');
      sortButton.classList.add(this.elements.content.cards.table.header.cell.sort);

      cell.append(sortButton);

      cell.addEventListener('click', () => {
        this.$statistics.sortNodes(cell.dataset.sort);
      });

      const statisticChange = () => {
        const isCurrentColumn = cell.dataset.sort === this.$statistics.sort.column;

        cell.classList.remove('sort-asc', 'sort-desc');

        if (isCurrentColumn && this.$statistics.sort.type) {
          cell.classList.toggle(`sort-${this.$statistics.sort.type}`);
        }
      };

      document.addEventListener('statistics-changed', statisticChange);
      document.addEventListener('statistics-destroy', () => {
        document.removeEventListener('statistics-changed', statisticChange);
      });
    });

    row.append(...cellsCollection);

    return row;
  }

  getStatisticsRow(statisticsItem) {
    const row = document.createElement('tr');
    const cellCategory = document.createElement('td');
    const cellWord = document.createElement('td');
    const cellTranslation = document.createElement('td');
    const cellTrain = document.createElement('td');
    const cellGameRight = document.createElement('td');
    const cellGameWrong = document.createElement('td');

    const cellsCollection = [cellCategory, cellWord, cellTranslation, cellTrain, cellGameRight, cellGameWrong];
    const percents = Mixin.calcWordGamePercent(statisticsItem);

    cellCategory.innerText = Mixin.uppercaseFirstLetter(statisticsItem.category);
    cellWord.innerText = Mixin.uppercaseFirstLetter(statisticsItem.key);
    cellTranslation.innerText = Mixin.uppercaseFirstLetter(statisticsItem.translation);
    cellTrain.innerText = statisticsItem.countTrain;
    cellGameRight.innerText = `${statisticsItem.countGameRight} (${percents.right}%)`;
    cellGameWrong.innerText = `${statisticsItem.countGameWrong} (${percents.wrong}%)`;

    row.classList.add(this.elements.content.cards.table.row.container);
    cellsCollection.forEach((cell) => cell.classList.add(this.elements.content.cards.table.row.cell));

    row.append(...cellsCollection);

    this.$statistics.collectionNodes.push({config: statisticsItem, el: row});

    return row;
  }

  setViewListeners() {
    document.addEventListener('route-change', () => {
      const {currentRoute} = this.$app.router;

      this.$app.containerClassRemove('route-category', 'route-statistics');

      if (currentRoute.includes('category')) {
        this.$app.containerClassAdd('route-category');

        this.$app.loadSoundsByCategory(currentRoute.split('/').pop());
        this.$game.fillGameWordsByCategory(currentRoute.split('/').pop());
      } else if (currentRoute === 'difficult') {
        this.$app.containerClassAdd('route-category');

        this.$statistics.getDifficultWords().forEach((word) => this.$app.loadSoundsByCategory(word.category));
        this.$game.fillGameWordsDifficult(this.$statistics.getDifficultWords());
      } else if (currentRoute === 'statistics') {
        this.$app.containerClassAdd('route-statistics');
      }

      if (this.$game.currentMode === this.$game.MODE_PLAY) this.$game.stopGame();
    });
  }
}
