import './index.html';
import './style.scss';
import keyboardLayout from './assets/keyboard-layout.json';

class Keyboard {
  constructor(input, keyboardLayout) {
    this.$el = null;
    this.input = {
      element: input,
      getElementInfo() {
        let out = {};

        out.cursorPosition = this.element.selectionStart;
        out.value = this.element.value;

        return out;
      },
      push(char) {
        let elementInfo = this.getElementInfo(),
          elementValue = elementInfo.value,
          cursorPosition = elementInfo.cursorPosition;

        this.element.value = elementValue.slice(0, cursorPosition) + char + elementValue.slice(cursorPosition);
        this.element.setSelectionRange(cursorPosition + 1, cursorPosition + 1);

        this.element.focus();
      },
      removeChar() {
        let elementInfo = this.getElementInfo(),
          elementValue = elementInfo.value,
          cursorPosition = elementInfo.cursorPosition;

        if (!cursorPosition)
          return;

        this.element.value = elementValue.slice(0, cursorPosition - 1) + elementValue.slice(cursorPosition);
        this.element.setSelectionRange(cursorPosition - 1, cursorPosition - 1);
      },
      moveCursorLeft() {
        let cursorPosition = this.element.selectionStart - 1;

        this.element.setSelectionRange(cursorPosition, cursorPosition);
      },
      moveCursorRight() {
        let cursorPosition = this.element.selectionStart + 1;

        this.element.setSelectionRange(cursorPosition, cursorPosition);
      }
    }
    this.keyboardLayout = keyboardLayout;

    this.classShow = 'show';
    this.classHide = 'hide';
    this.classWrapper = 'keyboard'
    this.classLine = 'keyboard__line';
    this.classButton = 'keyboard__line-button';
    this.classButtonWide = 'keyboard__line-button--wide';
    this.classButtonExtraWide = 'keyboard__line-button--extra-wide';
    this.classButtonText = 'keyboard__line-button-text';
    this.classButtonTextHide = 'keyboard__line-button-text--hide';
    this.classButtonTextShow = 'keyboard__line-button-text--show';

    this.eventChangeLanguage = 'changeLanguage';
    this.eventChangeRegistry = 'changeRegistry';

    this.currentLanguage = 'en';
    this.isShifted = false;
    this.isUppercase = false;

    this.highlightingButtons = {};

    this.isSoundAlowed = true;
    this.audio = new (window.AudioContext || window.webkitAudioContext)();
    this.sounds = {
      key_ru: {
        src: './assets/sounds/key_ru.mp3',
        buffer: null,
      },
      key_en: {
        src: './assets/sounds/key_en.mp3',
        buffer: null,
      },
      capslock: {
        src: './assets/sounds/capslock.mp3',
        buffer: null,
      },
      shift: {
        src: './assets/sounds/shift.mp3',
        buffer: null,
      },
      backspace: {
        src: './assets/sounds/backspace.mp3',
        buffer: null,
      },
      enter: {
        src: './assets/sounds/enter.mp3',
        buffer: null,
      },
    };
    this.loadSounds();

    this.isVoiceRecognitionActive = false;
    this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    this.recognition.lang = 'en-US';
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.setRecognitionListeners();

    this.keyboardCreate();
    this.setInputListeners();
  }

  keyboardCreate() {
    if (this.$el instanceof HTMLElement)
      return;

    this.buildKeyboardEntity();
  }

  keyboardShow() {
    this.$el.classList.add(this.classShow);
  }

  keyboardHide() {
    this.$el.classList.remove(this.classShow);
  }

  buildKeyboardEntity() {
    this.$el = document.createElement('div');

    this.$el.className = this.classWrapper;

    this.keyboardLayout.lines.forEach((line) => {
      this.$el.append(this.buildKeyboardLine(line));
    });

    document.body.append(this.$el);
  }

  buildKeyboardLine(lineConfig) {
    let line = document.createElement('div');

    line.className = this.classLine;

    lineConfig.forEach((button) => {
      line.append(this.buildKeyboardButton(button))
    });

    return line;
  }

  buildKeyboardButton(buttonConfig) {
    let button = document.createElement('div'),
      buttonText = document.createElement('span');

    button.className = `${this.classButton} key-${buttonConfig.keyCode}`;
    button.append(buttonText);

    buttonText.className = this.classButtonText;
    buttonText.innerText = this.getButtonChar(buttonConfig);


    if (buttonConfig.special)
      button.classList.add(this.classButtonWide);

    if (buttonConfig.special && buttonConfig.special === 'space')
      button.classList.add(this.classButtonExtraWide);


    const changeButtonChar = () => {
      let currentChar = button.innerText,
        newChar = this.getButtonChar(buttonConfig);

      if (currentChar === newChar)
        return;

      buttonText.classList.add(this.classButtonTextHide)

      buttonText.ontransitionend = () => {
        buttonText.ontransitionend = null;
        buttonText.innerText = this.getButtonChar(buttonConfig);

        buttonText.classList.add(this.classButtonTextShow);
        buttonText.classList.remove(this.classButtonTextHide);
        setTimeout(buttonText.classList.remove.bind(buttonText.classList, this.classButtonTextShow), 0);
      };
    };

    this.$el.addEventListener(this.eventChangeLanguage, changeButtonChar);

    this.$el.addEventListener(this.eventChangeRegistry, changeButtonChar);

    button.addEventListener('click', this.handleButtonClick.bind(this, buttonConfig));

    return button;
  }

  setInputListeners() {
    this.input.element.addEventListener('focus', () => {
      this.keyboardShow();
    });

    this.input.element.addEventListener('keydown', (event) => {
      if (event instanceof KeyboardEvent) {
        this.soundButtonByKeyCode(event.which);
        this.highlightButtonByKeyCode(event.which);

        if ([16, 20].includes(event.which)) {
          event.preventDefault();

          if (event.which === 20) {
            this.toggleUppercase();
          } else if (event.which === 16) {
            this.toggleShift();
          }

          return;
        }

        if (event.ctrlKey)
          return;

        let char = this.getButtonCharByKeyCode(event.which);

        if (char) {
          this.input.push(char);

          event.preventDefault();
        }
      }
    })
  }

  getButtonChar(buttonConfig) {
    let symbolCategory = (this.isShifted && buttonConfig.chars[this.currentLanguage].shift)
      ? 'shift'
      : (this.isShifted && this.isUppercase)
        ? 'normal'
        : (this.isUppercase || this.isShifted)
          ? 'uppercase'
          : 'normal';

    return buttonConfig.chars[this.currentLanguage][symbolCategory];
  }

  getButtonCharByKeyCode(keyCode) {
    let needleSymbol = '';

    keyboardLayout.lines.forEach((line) => {
      line.forEach((buttonConfig) => {
        if (buttonConfig.keyCode === keyCode && !buttonConfig.special) {
          needleSymbol = this.getButtonChar(buttonConfig);
        }
      });
    });

    return needleSymbol;
  }

  highlightButtonByKeyCode(keyCode) {
    let element = this.$el.querySelector(`.key-${keyCode}`);

    if (!element)
      return;

    if (this.highlightingButtons[keyCode]) {
      clearTimeout(this.highlightingButtons[keyCode]);
      delete this.highlightingButtons[keyCode];
    }

    element.classList.add('highlight');
    this.highlightingButtons[keyCode] = setTimeout(() => {
      element.classList.remove('highlight');

      delete this.highlightingButtons[keyCode];
    }, 250);
  }

  soundButtonByKeyCode(keyCode) {
    if (!this.isSoundAlowed)
      return;

    let needleSound = '';

    keyboardLayout.lines.forEach((line) => {
      line.forEach((buttonConfig) => {
        if (buttonConfig.keyCode === keyCode && buttonConfig.special) {
          needleSound = buttonConfig.special;
        }
      });
    });

    if (!this.sounds[needleSound])
      needleSound = `key_${this.currentLanguage}`;

    let source = this.audio.createBufferSource();

    source.connect(this.audio.destination);
    source.buffer = this.sounds[needleSound].buffer;
    source.start(0);
  }

  loadSounds() {
    for (let key in this.sounds) {
      fetch(this.sounds[key].src)
        .then((response) => response.arrayBuffer())
        .then((buffer) => this.audio.decodeAudioData(buffer, (decodedData) => {
          this.sounds[key].buffer = decodedData;
        }));
    }
  }

  handleButtonClick(buttonConfig, event) {
    if (buttonConfig.special) {
      if (buttonConfig.special === 'changeLanguage') {
        this.toggleLanguage();
      } else if (buttonConfig.special === 'capslock') {
        this.toggleUppercase();
      } else if (buttonConfig.special === 'shift') {
        this.toggleShift();
      } else if (buttonConfig.special === 'space') {
        this.input.push(' ');
      } else if (buttonConfig.special === 'backspace') {
        this.input.removeChar();
      } else if (buttonConfig.special === 'enter') {
        this.input.push("\n");
      } else if (buttonConfig.special === 'close') {
        this.keyboardHide();
      } else if (buttonConfig.special === 'arrow-left') {
        this.input.moveCursorLeft();
      } else if (buttonConfig.special === 'arrow-right') {
        this.input.moveCursorRight();
      } else if (buttonConfig.special === 'toggleSound') {
        this.toggleSound();
      } else if (buttonConfig.special === 'toggleVoiceRecognition') {
        this.toggleVoiceRecognition();
      }

      if (buttonConfig.special !== 'close')
        this.input.element.focus();
    } else {
      this.input.push(this.getButtonChar(buttonConfig));
    }

    this.soundButtonByKeyCode(buttonConfig.keyCode);
  }

  toggleLanguage() {
    this.currentLanguage = (this.currentLanguage === 'ru') ? 'en' : 'ru';

    this.toggleVoiceRecognitionLanguage();
    this.$el.dispatchEvent(new Event(this.eventChangeLanguage));
  }

  toggleUppercase() {
    this.isUppercase = !this.isUppercase;
    this.$el.classList[(this.isUppercase) ? 'add' : 'remove']('uppercase');

    this.$el.dispatchEvent(new Event(this.eventChangeRegistry));
  }

  toggleShift() {
    this.isShifted = !this.isShifted;
    this.$el.classList[(this.isShifted) ? 'add' : 'remove']('shifted');

    this.$el.dispatchEvent(new Event(this.eventChangeRegistry));
  }

  toggleSound() {
    this.isSoundAlowed = !this.isSoundAlowed;
    this.$el.classList[(!this.isSoundAlowed) ? 'add' : 'remove']('muted');
  }

  toggleVoiceRecognition() {
    this.isVoiceRecognitionActive = !this.isVoiceRecognitionActive;
    this.$el.classList[(this.isVoiceRecognitionActive) ? 'add' : 'remove']('listening');

    this.recognition[(this.isVoiceRecognitionActive) ? 'start' : 'stop']();
  }

  toggleVoiceRecognitionLanguage() {
    this.recognition.lang = (this.currentLanguage === 'ru') ? 'ru-RU' : 'en-US';
    this.recognition.stop();
  }

  setRecognitionListeners() {
    let previousResult = '';

    this.recognition.addEventListener('result', (e) => {
      let result = e.results[e.results.length - 1][0];

      if (!result)
        return;

      result = result.transcript;

      result = result.replace(/[^a-zа-я]+/gi, ' ').trim();

      let operation = ((this.isShifted && this.isUppercase) || (!this.isShifted && !this.isUppercase))
        ? 'toLowerCase'
        : 'toUpperCase';

      for (let i = 0; i < previousResult.length; i++) {
        this.input.removeChar();
      }

      previousResult = result = ' ' + result[operation]();

      result.split('').forEach((char) => this.input.push(char));
    });

    this.recognition.addEventListener('end', (e) => {
      previousResult = '';

      if (!this.isVoiceRecognitionActive)
        return;

      this.recognition.start();
    })
  }
}

new Keyboard(document.getElementById('main-textarea'), keyboardLayout);
