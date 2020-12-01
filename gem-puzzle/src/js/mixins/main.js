export default {
  getElementsByConfig(config) {
    let parentNode = null;

    const handleNodeByConfig = (node, nodeConfig) => {
      const nodeLocal = node;

      nodeLocal.className = nodeConfig.class;

      if (nodeConfig.text) nodeLocal.innerText = nodeConfig.text;

      if (nodeConfig.template) nodeLocal.innerHTML = nodeConfig.template;

      if (nodeConfig.click) nodeLocal.addEventListener('click', nodeConfig.click);

      if (nodeConfig.change) nodeLocal.addEventListener('change', nodeConfig.change);
    };

    Object.keys(config).forEach((key) => {
      const configItem = config[key];

      if (configItem.skip) return;

      if (configItem.container) {
        parentNode.append(this.getElementsByConfig(configItem));

        return;
      }

      const node = document.createElement(configItem.tag || 'div');
      configItem.el = node;

      handleNodeByConfig(node, configItem);

      if (key === 'container') {
        parentNode = node;
      } else {
        parentNode.append(node);
      }
    });

    return parentNode;
  },
  getFullDateFromTimestamp(timestamp) {
    const dateObject = new Date(timestamp);
    const year = dateObject.getFullYear();
    const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
    const date = dateObject.getDate().toString().padStart(2, '0');
    const hours = dateObject.getHours().toString().padStart(2, '0');
    const minutes = dateObject.getMinutes().toString().padStart(2, '0');
    const seconds = dateObject.getSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
  },
  getGridInitialByLength(length) {
    const out = [...new Array(length).keys()];

    out.shift();
    out.push(0);

    return out;
  },
  isGridSolvable(grid) {
    let kDisorder = 0;

    for (let i = 1, len = grid.length - 1; i < len; i += 1) {
      for (let j = i - 1; j >= 0; j -= 1) {
        if (grid[j] > grid[i]) {
          kDisorder += 1;
        }
      }
    }

    return !(kDisorder % 2);
  },
  getElementCoordinatesAbsolute(node) {
    return node.getBoundingClientRect();
  },
  toJson(data) {
    return JSON.stringify(data);
  },
  fromJson(data) {
    return JSON.parse(data);
  },
  checkArrayMatch(array1, array2) {
    return array1.length === array2.length && array1.every((value, index) => value === array2[index]);
  },
};
