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
  uppercaseFirstLetter(string) {
    return string[0].toUpperCase() + string.slice(1);
  },
};
