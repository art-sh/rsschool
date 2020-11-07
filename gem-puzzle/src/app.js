import './index.html';
import './style.scss';

class Puzzle {
  constructor() {
    this.config = {
      columns: 4,
      rows: 4,
    };
    this.grid = [];
    this.gridInitial = [];
    this.gridElements = [];
    this.gridElementExample = {
      id: null,
      element: null,
    };

    this.container = null;

    this.classNames = {
      container: 'puzzle',
      item: 'puzzle__item',
    };

    this.startNewGame();
    // debugger;
  }

  buildRandomGrid() {
    let values = [...new Array(this.config.columns * this.config.rows).keys()];
    this.gridInitial = Array.from(values);
    this.grid.length = 0;

    for (let row = 0; row < this.config.rows; row++) {
      let rowData = [];

      for (let column = 0; column < this.config.columns; column++) {
        let valuesKey = Math.floor((Math.random()) * values.length);

        rowData.push(values[valuesKey]);
        values.splice(valuesKey, 1);
      }

      this.grid.push(this.getGridLineProxy(rowData));
    }

    this.gridInitial.shift();
    this.gridInitial.push(0);
  }

  getGridLineProxy(obj) {
    let self = this;

    return new Proxy(obj, {
      set(target, property, value) {
        target[property] = value;

        self.sortGridElements();

        return true;
      }
    });
  }

  buildContainer() {
    if (this.container instanceof HTMLElement) {
      this.container.innerHTML = '';
      this.generateGridItems();

      return;
    }

    this.container = document.createElement('div');
    this.container.className = this.classNames.container;

    document.body.append(this.container);

    setTimeout(() => {
      this.setGridListeners();
      this.generateGridItems();
    }, 0);
  }

  generateGridItems() {
    for (let id = 0; id < (this.config.columns * this.config.rows); id++) {
      this.gridElements.push(this.generateGridItem(id));
    }
  }

  generateGridItem(id) {
    let config = JSON.parse(JSON.stringify(this.gridElementExample));
    let gridItem = document.createElement('div');

    gridItem.className = this.classNames.item;
    gridItem.innerText = (id) ? id.toString() : '';

    if (!id)
      gridItem.classList.add('inactive');

    this.container.append(gridItem);

    config.id = id;
    config.element = gridItem;

    return config;
  }

  setGridListeners() {
    this.container.addEventListener('click', (event) => {
      let elementConfig = this.gridElements.find((item) => item.element === event.target);

      if (!elementConfig)
        return;
      console.log(event, elementConfig, this.isMoveAvailable(elementConfig.id), this.getElementCoordinatesAvailable(elementConfig.id));

      if (this.isMoveAvailable(elementConfig.id)) {
        this.moveElementTo(this.getElementCoordinatesCurrent(elementConfig.id), this.getElementCoordinatesAvailable(elementConfig.id));

        this.handleSuccessEnd();
      }
    })
  }

  getElementCoordinatesCurrent(elementID) {
    try {
      this.grid.forEach((rowData, rowIndex) => {
        rowData.forEach((columnData, columnIndex) => {
          if (columnData === elementID)
            throw new Error(JSON.stringify({x: columnIndex, y: rowIndex}));
        });
      });
    } catch (e) {
      return JSON.parse(e.message);
    }
  }

  sortGridElements() {
    this.grid
      .reduce((out, item) => {
        out.push(...item);

        return out;
      }, [])
      .forEach((id, index) => {
        let target = this.gridElements.find((item) => item.id === id),
          parentNode = target.element.parentNode;

        parentNode.insertBefore(target.element, parentNode.children[index]);
      });
  }

  isMoveAvailable(elementID) {
    return this.getElementCoordinatesAvailable(elementID) !== false;
  }

  getElementCoordinatesAvailable(elementID) {
    let coordinates = this.getElementCoordinatesCurrent(elementID);

    if (this.grid[coordinates.y] && this.grid[coordinates.y][coordinates.x + 1] === 0) {
      return {x: coordinates.x + 1, y: coordinates.y};
    } else if (this.grid[coordinates.y] && this.grid[coordinates.y][coordinates.x - 1] === 0) {
      return {x: coordinates.x - 1, y: coordinates.y};
    } else if (this.grid[coordinates.y + 1] && this.grid[coordinates.y + 1][coordinates.x] === 0) {
      return {x: coordinates.x, y: coordinates.y + 1};
    } else if (this.grid[coordinates.y - 1] && this.grid[coordinates.y - 1][coordinates.x] === 0) {
      return {x: coordinates.x, y: coordinates.y - 1};
    }

    return false;
  }

  moveElementTo(coordsCurrent, coordsNew) {
    let backupOld = this.grid[coordsCurrent.y][coordsCurrent.x],
      backupNew = this.grid[coordsNew.y][coordsNew.x];

    this.grid[coordsCurrent.y][coordsCurrent.x] = backupNew;
    this.grid[coordsNew.y][coordsNew.x] = backupOld;
  }

  isGameComplete() {
    return JSON.stringify(this.gridInitial) === JSON.stringify(this.grid.reduce((out, item) => {
      out.push(...item);

      return out;
    }, []));
  }

  handleSuccessEnd() {
    if (this.isGameComplete())
      alert('you win');
  }

  startNewGame() {
    this.buildRandomGrid();
    this.buildContainer();

    setTimeout(() => {
      this.sortGridElements();
    });
  }
}

new Puzzle();