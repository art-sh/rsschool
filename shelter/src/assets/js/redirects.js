export default {
  main: () => window.location.pathname = window.location.pathname.replace(/^(\/art-sh-JS2020Q3\/shelter)?.*$/, '$1/pages/main'),
  pets: () => window.location.pathname = window.location.pathname.replace(/^(\/art-sh-JS2020Q3\/shelter)?.*$/, '$1/pages/our-pets'),
};