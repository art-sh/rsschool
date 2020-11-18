import Mixin from './js/mixins/main.js';

export default class Records {
  constructor(app) {
    this.$app = app;

    this.elements = {
      container: {
        class: 'puzzle__popup puzzle__records',
        el: null,
        modifiers: {
          show: 'puzzle__popup--show',
        }
      },
      header: {
        class: 'puzzle__popup-header',
        el: null,
        text: 'Best games',
      },
      list: {
        container: {
          class: 'puzzle__popup-list',
          el: null,
        },
        item: {
          skip: true,
          container: {
            class: 'puzzle__popup-list-item',
          },
          rank: {
            class: 'puzzle__popup-list-item-rank',
          },
          date: {
            class: 'puzzle__popup-list-item-date',
          },
          steps: {
            class: 'puzzle__popup-list-item-steps',
            text: 'steps: ',
          },
          time: {
            class: 'puzzle__popup-list-item-time',
            text: 'time: ',
          }
        },
      },
      close: {
        class: 'puzzle__popup-button',
        el: null,
        text: 'Close',
        click: function () {
          this.toggle();
        }.bind(this)
      }
    }

    this.isShow = false;
  }

  load() {
    this.$app.appendToMainContainer(Mixin.getElementsByConfig(this.elements));
  }

  toggle() {
    this.isShow = !this.isShow;
    (this.isShow) ? this.show() : this.hide();
  }

  show() {
    let bestGames = this.$app.storage.getBestGames();

    if (bestGames && bestGames.length) {
      this.elements.list.container.el.innerHTML = '';

      bestGames.forEach((game, index) => {
        this.elements.list.container.el.append(this.getBestGameElement(game, index));
      });
    } else {
      this.elements.list.container.el.innerText = 'Finish one game';
    }

    setTimeout(() => {
      this.elements.container.el.classList.add(this.elements.container.modifiers.show);
    });
  }

  hide() {
    this.elements.container.el.classList.remove(this.elements.container.modifiers.show);
  }

  getBestGameElement(data, index) {
    let config = this.elements.list.item;

    let parentNode = document.createElement('div');
    parentNode.className = config.container.class;

    let rank = document.createElement('div');
    rank.className = config.rank.class;
    rank.innerText = index + 1;

    let date = document.createElement('div');
    date.className = config.date.class;
    date.innerText = Mixin.getFullDateFromTimestamp(data.date);

    let steps = document.createElement('div');
    steps.className = config.steps.class;
    steps.innerText = `${config.steps.text}${data.steps}`;

    let time = document.createElement('div');
    time.className = config.time.class;
    time.innerText = `${config.time.text}${data.time}`;

    parentNode.append(rank);
    parentNode.append(date);
    parentNode.append(steps);
    parentNode.append(time);

    return parentNode;
  }
}