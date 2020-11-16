import Mixin from './js/mixins/main.js';

export default class Saves {
  constructor(app) {
    this.$app = app;

    this.elements = {
      container: {
        class: 'puzzle__popup puzzle__saves',
        el: null,
        modifiers: {
          show: 'puzzle__popup--show',
        },
      },
      save: {
        class: 'puzzle__popup-button',
        el: null,
        text: 'Save current game',
        click: function () {
          this.$app.storage.saveCurrentGame();
          this.show();
        }.bind(this)
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
          date: {
            class: 'puzzle__popup-list-item-date',
          },
          field: {
            class: 'puzzle__popup-list-item-field',
            text: 'Field: ',
          },
          actions: {
            container: {
              class: 'puzzle__popup-list-item-actions'
            },
            load: {
              class: 'puzzle__popup-list-item-load',
            },
            remove: {
              class: 'puzzle__popup-list-item-remove',
            },
          }
        },
      },
      close: {
        class: 'puzzle__popup-button',
        el: null,
        text: 'Close',
        click: this.toggle.bind(this)
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
    let savedGames = this.$app.storage.getSavedGames();

    if (savedGames && savedGames.length) {
      this.elements.list.container.el.innerHTML = '';

      savedGames.forEach((save) => {
        this.elements.list.container.el.append(this.createSaveElement(save));
      });
    } else {
      this.elements.list.container.el.innerText = 'No data';
    }

    setTimeout(() => {
      this.elements.container.el.classList.add(this.elements.container.modifiers.show);
    });
  }

  hide() {
    this.elements.container.el.classList.remove(this.elements.container.modifiers.show);
  }

  createSaveElement(save) {
    let config = this.elements.list.item;

    let parentNode = document.createElement('div');
    parentNode.className = config.container.class;

    let date = document.createElement('div');
    date.className = config.date.class;
    date.innerText = Mixin.getFullDateFromTimestamp(save.date)
      + ((save.game.id === this.$app.game.id) ? ' (current)' : '');

    let field = document.createElement('div');
    field.className = config.field.class;
    field.innerText = `${config.field.text} ${save.config.columns}x${save.config.rows}`;

    let actions = document.createElement('div');
    actions.className = config.actions.container.class;

    let load = document.createElement('div');
    load.className = config.actions.load.class;
    load.onclick = function () {
      this.$app.storage.loadSavedGame(save.game.id);
      this.toggle();
    }.bind(this);

    let remove = document.createElement('div');
    remove.className = config.actions.remove.class;
    remove.onclick = function () {
      this.$app.storage.removeSavedGame(save.game.id);
      this.show();
    }.bind(this);

    actions.append(load);
    actions.append(remove);

    parentNode.append(date);
    parentNode.append(field);
    parentNode.append(actions);

    return parentNode;
  }
}