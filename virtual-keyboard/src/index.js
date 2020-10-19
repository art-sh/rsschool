import './index.html'
import './style.scss'
import keyboardLayout from './assets/keyboard-layout.json'

class Keyboard {
  constructor(input, keyboardLayout) {
    this.$el = null;
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
    this.currentRegistry = 'normal';


    input.addEventListener('focus', () => {
      console.log('focus', this.keyboardLayout);
      this.keyboardShow()

      input.onkeydown = (e) => {
        console.log(e.key, e.which);
      }
    });

    input.addEventListener('blur', () => {
      console.log('blur');
      // this.keyboardHide();
    });
  }

  keyboardCreate() {
    if (this.$el instanceof HTMLElement)
      return;

    this.buildKeyboardEntity();
  }

  keyboardShow() {
    this.keyboardCreate();

    setTimeout(this.$el.classList.add.bind(this.$el.classList, this.classShow), 0);
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

    button.className = this.classButton;
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

  getButtonChar(buttonConfig) {
    return buttonConfig.chars[this.currentLanguage][this.currentRegistry];
  }

  handleButtonClick(buttonConfig) {
    console.log(buttonConfig);

    if (buttonConfig.special) {
      if (buttonConfig.special === 'changeLanguage') {
        this.toggleLanguage();
      }
    }
  }

  toggleLanguage() {
    console.log('lang');
    this.currentLanguage = (this.currentLanguage === 'ru') ? 'en' : 'ru';

    this.$el.dispatchEvent(new Event(this.eventChangeLanguage));
  }
}

new Keyboard(document.getElementById('main-textarea'), keyboardLayout);
