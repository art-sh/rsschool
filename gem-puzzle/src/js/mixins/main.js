export default {
  getElements() {
    return this.elements;
  },
  getElementsByConfig(config) {
    let parentNode = null;

    const handleNodeByConfig = (node, config) => {
      node.className = config.class;

      if (config.text)
        node.innerText = config.text;

      if (config.template)
        node.innerHTML = config.template;

      if (config.click)
        node.addEventListener('click', config.click);

      if (config.change)
        node.addEventListener('change', config.change);
    };

    Object.keys(config).forEach((key) => {
      let configItem = config[key];

      if (configItem.skip)
        return;

      if (configItem.container) {
        parentNode.append(this.getElementsByConfig(configItem));

        return;
      }

      let node = document.createElement(configItem.tag || 'div');
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
    let dateObject = new Date(timestamp),
      year = dateObject.getFullYear(),
      month = (dateObject.getMonth() + 1).toString().padStart(2, '0'),
      date = dateObject.getDate().toString().padStart(2, '0'),
      hours = dateObject.getHours().toString().padStart(2, '0'),
      minutes = dateObject.getMinutes().toString().padStart(2, '0'),
      seconds = dateObject.getSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
  }
}