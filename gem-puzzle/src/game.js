import Mixin from './js/mixins/main';

export default class Game {
  constructor(app) {
    Object.assign(this, Mixin);

    this.$app = app;

    this.id = Math.random();
    this.loadedData = null;

    this.grid = [];
    this.gridInitial = [];
    this.gridElements = [];
    this.gridElementExample = {
      id: null,
      element: null,
    };

    this.stats = this.getStatsProxy({
      minutes: 0,
      seconds: 0,
      steps: 0,
    });

    this.elements = {
      container: {
        class: 'puzzle__game',
        el: null,
        modifiers: {
          draggable: 'puzzle__game--draggable',
        },
      },
      grid: {
        container: {
          class: 'puzzle__game-grid',
          el: null,
          modifiers: {
            'container-9': 'puzzle__game-grid--grid9',
            'container-16': 'puzzle__game-grid--grid16',
            'container-25': 'puzzle__game-grid--grid25',
            'container-36': 'puzzle__game-grid--grid36',
            'container-49': 'puzzle__game-grid--grid49',
            'container-64': 'puzzle__game-grid--grid64',
          },
        },
        item: {
          class: 'puzzle__game-grid-item',
        },
        button: {
          class: 'puzzle__game-grid-item-button',
          modifiers: {
            active: 'puzzle__game-grid-item-button--active',
            inactive: 'puzzle__game-grid-item-button--inactive',
            draggable: 'puzzle__game-grid-item-button--draggable',
          },
        },
      },
      stats: {
        container: {
          class: 'puzzle__game-stats',
          el: null,
        },
        time: {
          class: 'puzzle__game-stats-time',
          el: null,
          text: 'Time:',
        },
        steps: {
          class: 'puzzle__game-stats-steps',
          el: null,
          text: 'Steps:',
        },
      },
    };

    this.audio = new (window.AudioContext || window.webkitAudioContext)();
    this.sounds = {
      snap: {
        src: 'assets/sounds/snap.mp3',
        buffer: null,
      },
    };

    this.imageNumber = null;
    this.imageParts = [];

    this.isBuilded = false;
    this.isMoving = false;
    this.isActive = false;
    this.isGameEnded = false;

    this.loadSounds();
  }

  getRandomGrid(grid = null) {
    if (grid && grid.length) {
      let gridCount = 0;
      this.grid.length = 0;

      grid.forEach((line) => {
        this.grid.push(line);

        gridCount += line.length;
      });

      this.gridInitial = Mixin.getGridInitialByLength(gridCount);

      return;
    }

    const gridInitial = Mixin.getGridInitialByLength(this.$app.config.columns
      * this.$app.config.rows);

    this.grid.length = 0;
    this.gridInitial = Array.from(gridInitial);

    for (let row = 0; row < this.$app.config.rows; row += 1) {
      const rowData = [];

      for (let column = 0; column < this.$app.config.columns; column += 1) {
        const valuesKey = Math.floor((Math.random()) * gridInitial.length);

        rowData.push(gridInitial[valuesKey]);
        gridInitial.splice(valuesKey, 1);
      }

      this.grid.push(rowData);
    }

    if (!Mixin.isGridSolvable(this.getGridAsArray())) this.getRandomGrid();
  }

  getGridAsArray() {
    return this.grid.reduce((out, line) => {
      out.push(...line);

      return out;
    }, []);
  }

  buildGameContainer() {
    this.elements.container.el = document.createElement('div');
    this.elements.container.el.className = this.elements.container.class;

    this.buildControlsContainer();
    this.buildGridContainer();

    this.$app.appendToMainContainer(this.elements.container.el);
  }

  buildGridContainer() {
    this.elements.grid.container.el = document.createElement('div');
    this.elements.grid.container.el.className = this.elements.grid.container.class;

    this.elements.container.el.append(this.elements.grid.container.el);

    setTimeout(() => {
      this.setGridListeners();
    });
  }

  buildGridItems(grid) {
    this.gridElements.length = 0;
    this.elements.grid.container.el.innerHTML = '';

    this.getRandomGrid(grid);
    this.getGridAsArray().forEach((id) => {
      const itemConfig = this.generateGridItem(id);

      this.gridElements.push(itemConfig);
      this.elements.grid.container.el.append(itemConfig.element.parentNode);
    });
    this.sortGridElements();
  }

  generateGridItem(id) {
    const config = JSON.parse(JSON.stringify(this.gridElementExample));

    const gridItem = document.createElement('div');
    gridItem.className = this.elements.grid.item.class;

    let gridButton = document.createElement('div');
    gridButton.innerText = (id) ? id.toString() : '';

    if (this.$app.config.imagesInsteadNumbers && id) gridButton = this.imageParts[id];

    gridButton.className = this.elements.grid.button.class;

    if (!id) gridButton.classList.add(this.elements.grid.button.modifiers.inactive);

    gridItem.append(gridButton);

    config.id = id;
    config.element = gridButton;

    return config;
  }

  setGridListeners() {
    this.elements.grid.container.el.addEventListener('mousedown', (event) => {
      if (this.isGameEnded || this.isMoving) return;

      let eventNode = event.target;

      if (eventNode.classList.contains(this.elements.grid.item.class)) eventNode = eventNode.querySelector(`.${this.elements.grid.button.class}`);

      const targetConfig = this.getElementConfigByNode(eventNode);

      if (!eventNode.classList.contains(this.elements.grid.button.modifiers.active)
        || !targetConfig) return;

      if (!this.isActive) {
        this.isActive = true;
        this.startListenGameTime();
      }

      const drag = {
        element: eventNode,
        coords: Mixin.getElementCoordinatesAbsolute(eventNode),
        mouse: {
          x: event.x,
          y: event.y,
        },
      };
      const self = this;

      drag.element.ontransitionend = (e) => {
        e.target.classList.remove(this.elements.grid.button.modifiers.draggable);

        setTimeout(() => {
          this.isMoving = false;
        });

        this.handleSuccessEnd();
        e.target.ontransitionend = null;
      };

      const mouseMove = () => {
        let timer = null;

        return (e) => {
          if (timer) {
            clearTimeout(timer);
            timer = null;
          }

          timer = setTimeout(() => {
            const handler = (eMove) => {
              if (Math.abs(drag.mouse.x - eMove.x) < 25 && Math.abs(drag.mouse.y - eMove.y) < 25) {
                return;
              }

              self.elements.container.el.classList.add(self.elements.container.modifiers.draggable);
              self.isMoving = true;

              const offset = {
                x: eMove.x - drag.coords.left - ((drag.coords.right - drag.coords.left) / 2),
                y: eMove.y - drag.coords.top - ((drag.coords.bottom - drag.coords.top) / 2),
              };

              drag.element.style.transition = 'unset';
              drag.element.style.transform = `translate(${offset.x}px, ${offset.y}px)`;
              drag.element.classList.add(this.elements.grid.button.modifiers.draggable);
            };

            handler.call(self, e);
            timer = null;
          });
        };
      };

      const mouseMoveBind = mouseMove();

      const mouseUp = (e) => {
        setTimeout(() => {
          this.elements.container.el.classList.remove(this.elements.container.modifiers.draggable);

          setTimeout(() => {
            if (e.target.classList.contains(this.elements.grid.button.modifiers.inactive)) {
              const inactiveConfig = this.getElementConfigByNode(e.target);
              const draggableConfig = this.getElementConfigByNode(drag.element);

              const inactiveCoords = this.getElementCoordinatesByID(inactiveConfig.id);
              const draggableCoords = this.getElementCoordinatesByID(draggableConfig.id);

              this.moveElementTo(draggableCoords, inactiveCoords);
            }

            if (!this.isMoving) {
              this.moveElementTo(
                this.getElementCoordinatesByID(targetConfig.id),
                this.getElementCoordinatesAvailable(targetConfig.id),
              );
            }

            setTimeout(() => {
              drag.element.removeAttribute('style');
            });
          });
        });

        document.removeEventListener('mousemove', mouseMoveBind);
        document.removeEventListener('mouseup', mouseUp);
      };

      document.addEventListener('mousemove', mouseMoveBind);
      document.addEventListener('mouseup', mouseUp);
    });
  }

  getElementCoordinatesByID(elementID) {
    try {
      this.grid.forEach((rowData, rowIndex) => {
        rowData.forEach((columnData, columnIndex) => {
          if (columnData === elementID) {
            throw new Error(JSON.stringify({
              x: columnIndex,
              y: rowIndex,
            }));
          }
        });
      });

      return null;
    } catch (e) {
      return JSON.parse(e.message);
    }
  }

  getElementCoordinatesAvailable(elementID) {
    const coordinates = this.getElementCoordinatesByID(elementID);

    if (this.grid[coordinates.y] && this.grid[coordinates.y][coordinates.x + 1] === 0) {
      return {
        x: coordinates.x + 1,
        y: coordinates.y,
      };
    }
    if (this.grid[coordinates.y] && this.grid[coordinates.y][coordinates.x - 1] === 0) {
      return {
        x: coordinates.x - 1,
        y: coordinates.y,
      };
    }
    if (this.grid[coordinates.y + 1] && this.grid[coordinates.y + 1][coordinates.x] === 0) {
      return {
        x: coordinates.x,
        y: coordinates.y + 1,
      };
    }
    if (this.grid[coordinates.y - 1] && this.grid[coordinates.y - 1][coordinates.x] === 0) {
      return {
        x: coordinates.x,
        y: coordinates.y - 1,
      };
    }

    return false;
  }

  getElementConfigByNode(node) {
    return this.gridElements.reduce((out, config) => ((config.element === node)
      ? config
      : out), null);
  }

  getNodeByCoordinates(x, y) {
    return this.elements.grid.container.el.children[x + y * this.$app.config.rows].children[0]
      || null;
  }

  sortGridElements() {
    this.grid
      .reduce((out, item) => {
        out.push(...item);

        return out;
      }, [])
      .forEach((id) => {
        const target = this.gridElements.find((item) => item.id === id);
        const targetCoords = this.getElementCoordinatesByID(id);
        const targetByCoords = this.getNodeByCoordinates(targetCoords.x, targetCoords.y);

        target.element.classList[(this.isMoveAvailable(id)) ? 'add' : 'remove'](this.elements.grid.button.modifiers.active);

        if (targetByCoords !== target.element) {
          this.switchNodes(target.element, this.getElementConfigByNode(targetByCoords).element);

          if (this.isActive) {
            this.stats.steps += 1;
          }
        }
      });
  }

  isMoveAvailable(elementID) {
    return this.getElementCoordinatesAvailable(elementID) !== false;
  }

  moveElementTo(coordsCurrent, coordsNew) {
    const backup = this.grid[coordsCurrent.y][coordsCurrent.x];

    this.grid[coordsCurrent.y][coordsCurrent.x] = this.grid[coordsNew.y][coordsNew.x];
    this.grid[coordsNew.y][coordsNew.x] = backup;

    this.sortGridElements();
  }

  switchNodes(first, second) {
    const firstLocal = first;
    const secondLocal = second;
    const parentFirst = first.parentNode;
    const parentSecond = second.parentNode;
    const coordsFirst = Mixin.getElementCoordinatesAbsolute(first);
    const coordsSecond = Mixin.getElementCoordinatesAbsolute(second);

    parentFirst.innerHTML = '';
    parentSecond.innerHTML = '';

    parentFirst.append(second);
    parentSecond.append(first);

    firstLocal.style.transition = 'unset';
    if (!firstLocal.classList.contains(this.elements.grid.button.modifiers.inactive)) {
      firstLocal.style.transform = `translate(${coordsFirst.x - coordsSecond.x}px, ${coordsFirst.y - coordsSecond.y}px)`;
    }

    secondLocal.style.transition = 'unset';
    if (!secondLocal.classList.contains(this.elements.grid.button.modifiers.inactive)) {
      secondLocal.style.transform = `translate(${coordsSecond.x - coordsFirst.x}px, ${coordsSecond.y - coordsFirst.y}px)`;
    }

    setTimeout(() => {
      this.playSound();

      first.removeAttribute('style');
      second.removeAttribute('style');
    });
  }

  isGameComplete() {
    return JSON.stringify(this.gridInitial) === JSON.stringify(this.grid.reduce((out, item) => {
      out.push(...item);

      return out;
    }, []));
  }

  handleSuccessEnd() {
    if (!this.isGameEnded && this.isGameComplete()) {
      this.isActive = false;
      this.isGameEnded = true;

      this.$app.storage.saveBestGames();

      setTimeout(() => {
        alert(`Ура! Вы решили головоломку за ${this.getTimeString()} и ${this.stats.steps} ходов`);
      });
    }
  }

  startNewGame() {
    if (!this.isBuilded) {
      this.buildGameContainer();

      this.isBuilded = true;
    }

    this.setGridContainerClass(this.$app.config.rows * this.$app.config.columns);
    this.elements.grid.container.el.style.transition = 'unset';
    this.elements.grid.container.el.style.opacity = '0';

    const imageNumber = (this.loadedData)
      ? this.loadedData.imageNumber
      : null;

    this.genImageParts(() => {
      if (this.loadedData) {
        this.buildGridItems(this.loadedData.grid);

        this.stats.minutes = this.loadedData.stats.minutes || 0;
        this.stats.seconds = this.loadedData.stats.seconds || 0;
        this.stats.steps = this.loadedData.stats.steps || 0;
      } else {
        this.buildGridItems();

        this.id = Math.random();

        this.stats.minutes = 0;
        this.stats.seconds = 0;
        this.stats.steps = 0;
      }

      setTimeout(() => {
        this.elements.grid.container.el.removeAttribute('style');
      });

      this.isMoving = false;
      this.isActive = false;
      this.isGameEnded = this.isGameComplete();
      this.loadedData = null;
    }, imageNumber);
  }

  buildControlsContainer() {
    this.elements.stats.container.el = document.createElement('div');
    this.elements.stats.container.el.className = this.elements.stats.container.class;

    this.elements.container.el.append(this.elements.stats.container.el);

    Object.keys(this.elements.stats)
      .forEach((key) => {
        if (key === 'container') return;

        this.elements.stats[key].el = document.createElement('div');
        this.elements.stats[key].el.className = this.elements.stats[key].class;

        this.elements.stats.container.el.append(this.elements.stats[key].el);
      });
  }

  getStatsProxy(obj) {
    const self = this;

    return new Proxy(obj, {
      set(target, property, value) {
        const proxy = target;

        proxy[property] = value;

        if (['minutes', 'seconds'].includes(property)) {
          self.elements.stats.time.el.innerText = `${self.elements.stats.time.text} ${self.getTimeString()}`;
        } else if (property === 'steps') {
          self.elements.stats.steps.el.innerText = `${self.elements.stats.steps.text} ${value.toString()}`;
        }

        return true;
      },
    });
  }

  startListenGameTime() {
    setTimeout(() => {
      if (!this.isActive) return;

      this.stats.seconds += 1;

      if (this.stats.seconds === 60) {
        this.stats.minutes += 1;
        this.stats.seconds = 0;
      }

      this.startListenGameTime();
    }, 1000 - new Date().getMilliseconds());
  }

  getTimeString() {
    return `${this.stats.minutes.toString().padStart(2, '0')}:${this.stats.seconds.toString().padStart(2, '0')}`;
  }

  loadSounds() {
    Object.keys(this.sounds).forEach((key) => {
      fetch(this.sounds[key].src)
        .then((response) => response.arrayBuffer())
        .then((buffer) => this.audio.decodeAudioData(buffer, (decodedData) => {
          this.sounds[key].buffer = decodedData;
        }));
    });
  }

  playSound() {
    if (!this.$app.config.isSoundAllowed) return;

    const source = this.audio.createBufferSource();

    source.connect(this.audio.destination);
    source.buffer = this.sounds.snap.buffer;
    source.start(0);
  }

  genImageParts(cb, imageNumber = null) {
    this.imageNumber = imageNumber || Math.ceil(150 * Math.random());
    this.imageParts.length = 0;

    const imageName = `./assets/img/box/${this.imageNumber}.jpg`;
    const image = new Image();

    image.onload = () => {
      const pathX = image.width / this.$app.config.columns;
      const pathY = image.height / this.$app.config.rows;

      for (let row = 0; row < this.$app.config.rows; row += 1) {
        for (let col = 0; col < this.$app.config.columns; col += 1) {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = '100';
          canvas.width = '100';

          context.drawImage(image, col * pathX, row * pathY, pathX, pathY, 0, 0,
            canvas.width, canvas.height);

          this.imageParts.push(canvas);
        }
      }

      return cb && cb();
    };
    image.src = imageName;
  }

  setGridContainerClass(length) {
    const gridElement = this.elements.grid.container.el;
    const modifiersCollection = this.elements.grid.container.modifiers;

    Object.keys(modifiersCollection).forEach((modifier) => {
      gridElement.classList[modifier === `container-${length}` ? 'add' : 'remove'](modifier);
    });
  }
}
