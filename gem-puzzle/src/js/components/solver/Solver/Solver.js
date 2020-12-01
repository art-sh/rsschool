export default class Solver {
  constructor(table) {
    this.closed = new Map();
    this.opened = new Map();
    this.length = table.matrix.length;

    this.opened.set(table.getUnique(), table);
  }

  getMin() {
    return this.opened.get([...this.opened.keys()].reduce((curMin, key) => {
      const { fullHeap } = this.opened.get(key);
      if (fullHeap < curMin.min) {
        curMin.min = fullHeap;
        curMin.key = key;
      }
      return curMin;
    }, {
      min: +Infinity,
      key: null,
    }).key);
  }

  isSolvable() {
    const curNode = this.getMin();
    const array = curNode.getUnique().split(',').map((val) => +val);

    let n = curNode.zero.y + 1;
    array.forEach((value, index) => {
      if (value !== 0) {
        for (let i = index + 1; i < array.length; i += 1) {
          if (array[i] < value && array[i] !== 0) {
            n += 1;
          }
        }
      }
    });
    return n % 2 === 0;
  }

  _getChain(solution, short = false) {
    const result = [];
    while (solution) {
      result.push(short ? (solution.zero.y * solution.dimension) + solution.zero.x + 1 : solution.printPretty());
      solution = solution.parent;
    }
    return result.reverse();
  }

  search(short = false) {
    if (this.length === 4) {
      if (!this.isSolvable()) {
        return null;
      }
    }

    while (this.opened.size !== 0) {
      const curNode = this.getMin();

      if (curNode.isSolve()) {
        return this._getChain(curNode, short);
      }

      this.opened.delete(curNode.getUnique());
      this.closed.set(curNode.getUnique(), curNode);

      const nextStages = curNode.getNextStages();
      nextStages.forEach((table) => {
        if (this.closed.has(table.getUnique())) {
          return;
        }
        const repeat = this.opened.get(table.getUnique());
        if (!repeat) {
          this.opened.set(table.getUnique(), table);
        } else if (table.globalNesting < repeat.globalNesting) {
          this.opened.set(table.getUnique(), table);
        }
      });
    }

    return null;
  }
}
