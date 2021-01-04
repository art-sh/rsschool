import './index.html';
import 'reveal.js/dist/reveal.css';
import 'reveal.js/dist/theme/black.css';
// import 'reveal.js/css/theme/template/'
import 'reveal.js/plugin/highlight/monokai.css';
import Vue from 'vue';

import Reveal from 'reveal.js';
import Hightlight from 'reveal.js/plugin/highlight/highlight.esm';

Reveal.addEventListener('ready', function (event) {
  const app1 = new Vue({
    el: '#app-reactivity',
    data: {
      first: 'some',
      second: '',
    },
  });

  app1.second = 'value';

  new Vue({
    el: '#app-data-binding',
    data: {
      vueText: 'default',
    },
  });

  new Vue({
    el: '#app-property-binding',
    data: {
      blockStyle: '',
    },
    methods: {
      setGreenText() {
        this.blockStyle = 'color: green';
      },
    },
  });

  new Vue({
    el: '#app-components',
    data: {
      children: [],
    },
    methods: {
      addChild() {
        this.children.push({
          text: Math.random(),
        });
      },
    },
  });
});

Reveal.initialize({
  plugins: [Hightlight],
});