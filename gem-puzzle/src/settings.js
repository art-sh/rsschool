import Mixin from './js/mixins/main';

export default class Settings {
  constructor(app) {
    this.$app = app;

    this.config = this.getConfigProxy({
      columns: 4,
      rows: 4,
      isSoundAllowed: true,
      imagesInsteadNumbers: true,
    });

    this.elements = {
      container: {
        class: 'puzzle__header',
        el: null,
      },
      logo: {
        class: 'puzzle__header-logo',
        el: null,
        text: 'Gem puzzle',
      },
      settingsButton: {
        class: 'puzzle__header-settings-toggle',
        el: null,
        click: this.toggle.bind(this),
      },
      settings: {
        container: {
          class: 'puzzle__header-settings',
          el: null,
          modifiers: {
            show: 'puzzle__header-settings--show',
          },
        },
        play: {
          container: {
            class: 'puzzle__header-settings-line',
            el: null,
          },
          button: {
            class: 'puzzle__header-settings-line-button',
            el: null,
            text: 'Start new game',
            click: function () {
              this.$app.game.id = Math.random();
              this.$app.game.startNewGame();
              this.toggle();
            }.bind(this),
          },
        },
        grid: {
          container: {
            class: 'puzzle__header-settings-line',
            el: null,
          },
          text: {
            class: 'puzzle__header-settings-line-text',
            el: null,
            text: 'Field size:',
          },
          dropdown: {
            class: 'puzzle__header-settings-line-dropdown',
            el: null,
            tag: 'select',
            template: `
              <option value='{"columns":3,"rows":3}'>3x3</option>
              <option value='{"columns":4,"rows":4}'>4x4</option>
              <option value='{"columns":5,"rows":5}'>5x5</option>
              <option value='{"columns":6,"rows":6}'>6x6</option>
              <option value='{"columns":7,"rows":7}'>7x7</option>
              <option value='{"columns":8,"rows":8}'>8x8</option>`,
            change: function (event) {
              const value = JSON.parse(event.target.value);

              this.config.columns = value.columns;
              this.config.rows = value.rows;
            }.bind(this),
          },
          subtext: {
            class: 'puzzle__header-settings-line-subtext',
            el: null,
            text: '(need new game)',
          },
        },
        sound: {
          container: {
            class: 'puzzle__header-settings-line',
            el: null,
          },
          text: {
            class: 'puzzle__header-settings-line-text',
            el: null,
            text: 'Sound active:',
          },
          checkbox: {
            class: 'puzzle__header-settings-line-checkbox',
            el: null,
            template: `
              <input type="checkbox" id="settings-sound" hidden>
              <label for="settings-sound"></label>`,
            click: function (e) {
              const checkbox = e.target.parentNode.children[0];
              checkbox.checked = !checkbox.checked;

              this.config.isSoundAllowed = checkbox.checked;
            }.bind(this),
          },
        },
        images: {
          container: {
            class: 'puzzle__header-settings-line',
            el: null,
          },
          text: {
            class: 'puzzle__header-settings-line-text',
            el: null,
            text: 'Images instead numbers:',
          },
          checkbox: {
            class: 'puzzle__header-settings-line-checkbox',
            el: null,
            template: `
              <input type="checkbox" id="settings-images" hidden>
              <label for="settings-images"></label>`,
            click: function (e) {
              const checkbox = e.target.parentNode.children[0];
              checkbox.checked = !checkbox.checked;

              this.config.imagesInsteadNumbers = checkbox.checked;
            }.bind(this),
          },
        },
        records: {
          container: {
            class: 'puzzle__header-settings-line',
            el: null,
          },
          text: {
            class: 'puzzle__header-settings-line-text',
            el: null,
            text: 'Table records:',
          },
          button: {
            class: 'puzzle__header-settings-line-button',
            el: null,
            text: 'show',
            click: this.$app.records.toggle.bind(this.$app.records),
          },
        },
        saves: {
          container: {
            class: 'puzzle__header-settings-line',
            el: null,
          },
          text: {
            class: 'puzzle__header-settings-line-text',
            el: null,
            text: 'Saved games:',
          },
          button: {
            class: 'puzzle__header-settings-line-button',
            el: null,
            text: 'show',
            click: this.$app.saves.toggle.bind(this.$app.saves),
          },
        },
      },
    };

    this.isShow = false;
  }

  load() {
    this.$app.appendToMainContainer(Mixin.getElementsByConfig(this.elements));

    const localSettings = this.$app.storage.getSettings() || this.config;

    Object.keys(localSettings)
      .forEach((key) => {
        this.config[key] = localSettings[key];
      });
  }

  getConfigProxy(obj) {
    const self = this;

    return new Proxy(obj, {
      set(target, property, value) {
        const backup = target[property];
        const proxy = target;

        proxy[property] = value;
        self.$app.storage.saveSettings();

        if (['columns', 'rows'].includes(property)) self.elements.settings.grid.dropdown.el.value = JSON.stringify({ columns: proxy.columns, rows: proxy.rows });

        if (property === 'isSoundAllowed') self.elements.settings.sound.checkbox.el.children[0].checked = proxy.isSoundAllowed;

        if (property === 'imagesInsteadNumbers') {
          self.elements.settings.images.checkbox.el.children[0]
            .checked = proxy.imagesInsteadNumbers;

          if (backup !== value && self.isShow) {
            self.$app.storage.saveCurrentGame();
            self.$app.storage.loadSavedGame((self.$app.game.grid.length)
              ? self.$app.game.id
              : null);
          }
        }

        return true;
      },
    });
  }

  toggle() {
    this.isShow = !this.isShow;
    return (this.isShow) ? this.show() : this.hide();
  }

  show() {
    this.$app.game.isActive = false;
    this.elements.settings.container.el.classList
      .add(this.elements.settings.container.modifiers.show);
  }

  hide() {
    this.elements.settings.container.el.classList
      .remove(this.elements.settings.container.modifiers.show);
  }
}
