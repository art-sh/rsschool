import './index.html';
import './style.scss';

class Momentum {
  constructor(container) {
    this.currentDate = {
      day: this.buildDateProxy({
        name: 'day',
        value: '',
        class: 'momentum__content-date-day',
        element: null
      }),
      date: this.buildDateProxy({
        name: 'date',
        value: '',
        class: 'momentum__content-date-date',
        element: null
      }),
      month: this.buildDateProxy({
        name: 'month',
        value: '',
        class: 'momentum__content-date-month',
        element: null
      }),
      hours: this.buildDateProxy({
        name: 'hours',
        value: '',
        class: 'momentum__content-time-hours',
        element: null
      }),
      minutes: this.buildDateProxy({
        name: 'minutes',
        value: '',
        class: 'momentum__content-time-minutes',
        element: null
      }),
      seconds: this.buildDateProxy({
        name: 'seconds',
        value: '',
        class: 'momentum__content-time-seconds',
        element: null
      }),
    };

    this.currentPeriod = [
      this.buildPeriodProxy({
        periodName: 'morning',
        periodImages: {
          '06': null,
          '07': null,
          '08': null,
          '09': null,
          '10': null,
          '11': null,
        },
        isInPeriod(hour) {
          return Object.keys(this.periodImages).includes(hour);
        },
        fillImagesByArray(arr) {
          let count = 0;

          for (let key in this.periodImages) {
            this.periodImages[key] = `./assets/images/${this.periodName}/${arr[count++]}.jpg`;
          }
        },
        isActive: false,
        isDark: false
      }),
      this.buildPeriodProxy({
        periodName: 'day',
        periodImages: {
          '12': null,
          '13': null,
          '14': null,
          '15': null,
          '16': null,
          '17': null,
        },
        isInPeriod(hour) {
          return Object.keys(this.periodImages).includes(hour);
        },
        fillImagesByArray(arr) {
          let count = 0;

          for (let key in this.periodImages) {
            this.periodImages[key] = `./assets/images/${this.periodName}/${arr[count++]}.jpg`;
          }
        },
        isActive: false,
        isDark: false
      }),
      this.buildPeriodProxy({
        periodName: 'evening',
        periodImages: {
          '18': null,
          '19': null,
          '20': null,
          '21': null,
          '22': null,
          '23': null,
        },
        isInPeriod(hour) {
          return Object.keys(this.periodImages).includes(hour);
        },
        fillImagesByArray(arr) {
          let count = 0;

          for (let key in this.periodImages) {
            this.periodImages[key] = `./assets/images/${this.periodName}/${arr[count++]}.jpg`;//
          }
        },
        isActive: false,
        isDark: true
      }),
      this.buildPeriodProxy({
        periodName: 'night',
        periodImages: {
          '00': null,
          '01': null,
          '02': null,
          '03': null,
          '04': null,
          '05': null,
        },
        isInPeriod(hour) {
          return Object.keys(this.periodImages).includes(hour);
        },
        fillImagesByArray(arr) {
          let count = 0;

          for (let key in this.periodImages) {
            this.periodImages[key] = `./assets/images/${this.periodName}/${arr[count++]}.jpg`;
          }
        },
        isActive: false,
        isDark: true
      })
    ];

    this.lockImageChange = false;
    this.lockQuoteChange = false;

    this.weatherApiKey = '006b7eb55b69c38c3e1040a0af75546b';

    this.storage = this.buildStorageProxy({
      name: '',
      focus: '',
      weatherCity: '',
    });

    this.classList = {
      background: 'momentum__background',
      period: 'momentum__content-hello-welcome-period',
      name: 'momentum__content-hello-name',
      focus: 'momentum__content-focus-target',
      chillMode: 'momentum__content-header',
      generateImage: 'momentum__image-generate-button',
      generateQuote: 'momentum__content-quote-header',
      generateQuoteIndicator: 'momentum__content-quote-header-indicator',
      quoteText: 'momentum__content-quote-content',
      quoteAuthor: 'momentum__content-quote-author',
      weatherCity: 'momentum__content-weather-city',
      weatherTemperatureIcon: 'momentum__content-weather-info-temperature-icon',
      weatherTemperatureText: 'momentum__content-weather-info-temperature-text',
      weatherWindText: 'momentum__content-weather-info-wind-text',
      weatherHumidityText: 'momentum__content-weather-info-humidity-text',
    }

    this.baseText = {
      name: '[Enter Name]',
      focus: '[Enter Focus]',
      weatherCity: '[Loading City]',
    }

    this.dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    this.monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    this.quoteUrl = 'https://favqs.com/api/qotd'

    this.container = container;
    this.backgroundElement = container.querySelector(`.${this.classList.background}`);
    this.periodElement = container.querySelector(`.${this.classList.period}`);
    this.nameElement = container.querySelector(`.${this.classList.name}`);
    this.focusElement = container.querySelector(`.${this.classList.focus}`);
    this.chillModeElement = container.querySelector(`.${this.classList.chillMode}`);
    this.generateImageElement = container.querySelector(`.${this.classList.generateImage}`);
    this.generateQuoteElement = container.querySelector(`.${this.classList.generateQuote}`);
    this.quoteTextElement = container.querySelector(`.${this.classList.quoteText}`);
    this.quoteAuthorElement = container.querySelector(`.${this.classList.quoteAuthor}`);
    this.weatherCityElement = container.querySelector(`.${this.classList.weatherCity}`);
    this.weatherTemperatureIconElement = container.querySelector(`.${this.classList.weatherTemperatureIcon}`);
    this.weatherTemperatureTextElement = container.querySelector(`.${this.classList.weatherTemperatureText}`);
    this.weatherWindTextElement = container.querySelector(`.${this.classList.weatherWindText}`);
    this.weatherHumidityTextElement = container.querySelector(`.${this.classList.weatherHumidityText}`);
    this.assignDateElements();

    this.setListeners();

    this.getRandomQuote();
    this.getWeatherByCity(this.storage.city || 'Minsk');
  }

  buildDateProxy(obj) {
    let self = this;

    return new Proxy(obj, {
      set(proxy, property, value) {
        let oldValue = proxy[property];

        if (value < 10)
          value = `0${value}`;

        if (oldValue === value)
          return true;

        proxy[property] = value;

        if (property === 'value')
          self.updateDateElementValue(proxy.element, value);

        if (proxy.name === 'hours' && proxy.value !== '')
          self.setCurrentPeriod()

        return true;
      }
    })
  }

  buildPeriodProxy(obj) {
    let self = this;

    obj.fillImagesByArray(this.fillArrayByRandom(6));

    return new Proxy(obj, {
      set(proxy, property, value) {
        let oldValue = proxy[property];

        if (oldValue === value)
          return true;

        proxy[property] = value;

        if (proxy.isActive) {
          self.setNewBackground(proxy.periodImages[self.currentDate.hours.value]);
          self.updatePeriodValue(proxy.periodName);
        }

        return true;
      }
    });
  }

  buildStorageProxy(obj) {
    return new Proxy(obj, {
      get(proxy, property) {
        let memoryValue = proxy[property];

        if (!memoryValue)
          memoryValue = localStorage.getItem(`__${property}`) || '';

        return memoryValue;
      },
      set(proxy, property, value) {
        proxy[property] = value;

        localStorage[(value.trim() === '') ? 'removeItem' : 'setItem'](`__${property}`, value);

        return true;
      }
    });
  }

  fetch(url, callback, type = 'text') {
    fetch(url)
      .then(response => type === 'json' ? response.json() : response.text())
      .then(callback);
  }

  setListeners() {
    this.setChillModeListener();
    this.setInputListeners();
    this.setGenerateImageListener();
    this.setGenerateQuoteListener();
  }

  assignDateElements() {
    for (let dateKey in this.currentDate) {
      let dateItem = this.currentDate[dateKey];

      dateItem.element = this.container.querySelector(`.${dateItem.class}`);
    }

    this.startCount();
  }

  startCount() {
    let currentDate = new Date();

    this.currentDate.day.value = this.dayNames[currentDate.getDay()]
    this.currentDate.date.value = '' + currentDate.getUTCDate()
    this.currentDate.month.value = this.monthNames[currentDate.getMonth()]
    this.currentDate.hours.value = '' + currentDate.getHours()
    this.currentDate.minutes.value = '' + currentDate.getMinutes()
    this.currentDate.seconds.value = '' + currentDate.getSeconds()

    setTimeout(this.startCount.bind(this), 1000 - String(Date.now()).slice(-3));
  }

  updateDateElementValue(element, value) {
    if (element)
      element.innerText = value;
  }

  setCurrentPeriod() {
    this.currentPeriod.forEach((period) => {
      period.isActive = period.isInPeriod(this.currentDate.hours.value);
    });
  }

  updatePeriodValue(value) {
    this.periodElement.innerText = value;
  }

  setInputListeners() {
    ['name', 'focus', 'weatherCity'].forEach((item) => this.setInputListener(item));
  }

  setInputListener(key) {
    let element = this[`${key}Element`],
      defaultValue = this.baseText[key],
      storage = this.storage;

    element.addEventListener('focus', setTimeout.bind(null, () => element.innerText = '', 0));

    element.addEventListener('keypress', (event) => {
      if (event.keyCode === 13 || event.which === 13)
        element.blur();
    });

    element.addEventListener('blur', () => {
      element.innerText = element.innerText.trim();

      if (element.innerText === '')
        element.innerText = storage[key] || defaultValue;

      if (element.innerText !== '' && key === 'weatherCity')
        this.getWeatherByCity(element.innerText !== defaultValue ? element.innerText : 'Minsk');

      setTimeout(() => storage[key] = element.innerText, 0);
    });

    element.innerText = storage[key] || '';
    element.dispatchEvent(new Event('blur'));
  }

  fillArrayByRandom(length) {
    return Array.from({length: 20}, (_, i) => i + 1)
      .sort((a, b) => Math.random() - 0.5)
      .slice(0, length);
  }

  setNewBackground(path, cb) {
    let img = new Image();
    img.src = path;
    img.onload = () => {
      this.backgroundElement.style.backgroundImage = `url('${path}')`;

      cb && cb();
    };
  }

  getRandomQuote() {
    if (this.lockQuoteChange)
      return;

    this.lockQuoteChange = true;
    this.generateQuoteElement.classList.add('animate');

    this.fetch(this.quoteUrl, (response) => {
      let quoteResponse = JSON.parse(response);

      this.quoteTextElement.innerText = `${quoteResponse.quote.body} (${quoteResponse.quote.author})`;

      setTimeout(() => {
        this.lockQuoteChange = false;
        this.generateQuoteElement.classList.remove('animate');
      }, 1000, this);
    });
  }

  setGenerateImageListener() {
    this.generateImageElement.addEventListener('click', () => {
      if (this.lockImageChange)
        return;

      let backgroundsInfo = this.getBackgroundsInfo();
      this.generateImageElement.classList.add('animate');
      this.lockImageChange = true;

      this.setNewBackground(backgroundsInfo.next, () => {
        setTimeout(() => {
          this.lockImageChange = false;
          this.generateImageElement.classList.remove('animate');
        }, 500, this);
      })
    })
  }

  setChillModeListener() {
    this.chillModeElement.addEventListener('click', () => {
      this.container.classList.toggle('transparent');
    });
  }

  getBackgroundsInfo() {
    let allBackgrounds = [],
      currentBackgroundImage = this.backgroundElement.style.backgroundImage;

    for (let key in this.currentPeriod) {
      Object.values(this.currentPeriod[key].periodImages)
        .forEach((background) => allBackgrounds.push(background.slice(2)));
    }

    return allBackgrounds.reduce((out, background, index) => {
      if (currentBackgroundImage.includes(background)) {
        out.current = background;
        out.next = allBackgrounds[index + 1] || allBackgrounds[0];
      }

      return out;
    }, {});
  }

  setGenerateQuoteListener() {
    this.generateQuoteElement.addEventListener('click', this.getRandomQuote.bind(this));
  }

  getWeatherByCity(city) {
    this.fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.weatherApiKey}&units=metric`, (response) => {
      if (response.cod != '200') {
        alert(`${response.message[0].toUpperCase()}${response.message.slice(1)}, setting default city.`);
        this.getWeatherByCity('Minsk');

        return;
      }

      this.weatherCityElement.innerText = response.name;
      this.storage.weatherCity = response.name;

      this.weatherTemperatureIconElement.classList.remove(this.weatherTemperatureIconElement.classList[this.weatherTemperatureIconElement.classList.length - 1]);
      this.weatherTemperatureIconElement.classList.add(`owf-${response.weather[0].id}`)
      this.weatherTemperatureTextElement.innerText = `${response.main.temp} °`
      this.weatherWindTextElement.innerText = `${response.wind.speed} m/s`;
      this.weatherHumidityTextElement.innerText = `${response.main.humidity} %`;
    }, 'json');
  }
}

new Momentum(document.getElementById('main__container'));