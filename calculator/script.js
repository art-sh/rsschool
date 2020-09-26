class Calculator {
  constructor(previousOperandTextElement, currentOperandTextElement) {
    this.previousOperandTextElement = previousOperandTextElement;
    this.currentOperandTextElement = currentOperandTextElement;
    this.readyToReset = false;
    this.isSingleOperator = false;
    this.isError = false;
    this.clear();
  }

  clear() {
    this.currentOperand = '';
    this.previousOperand = '';
    this.operation = undefined;
    this.isError = false;
    this.isSingleOperator = false;
    this.readyToReset = false;
  }

  delete() {
    if (this.readyToReset && this.previousOperand === '') {
      this.clear();

      return;
    }

    this.currentOperand = this.currentOperand.toString().slice(0, -1);
  }

  appendNumber(number) {
    if (number === '.' && this.currentOperand.includes('.'))
      return;

    if (number === '.' && !this.currentOperand.toString().length) {
      this.currentOperand = this.currentOperand.toString() + '0' + number.toString();
    } else {
      this.currentOperand = this.currentOperand.toString() + number.toString();
    }
  }

  chooseOperation(operation) {
    if ('+/-' === operation) {
      if (this.currentOperand.length && !this.currentOperand.includes('-')) {
        this.currentOperand = `-${this.currentOperand}`;
      } else {
        this.currentOperand = this.currentOperand.replace('-', '');
      }

      return;
    }

    if ((this.previousOperand !== '' && this.currentOperand !== '') && this.operation !== operation)
      this.compute(this.operation);

    this.operation = operation || this.operation;
    this.isSingleOperator = false;
    this.isError = false;

    if (this.currentOperand && !this.previousOperand) {
      this.previousOperand = this.currentOperand;
      this.currentOperand = '';
    }

    if ((this.previousOperand !== '' && this.currentOperand !== '')
      || (this.previousOperand !== '' && ['√'].includes(operation))
    ) {
      this.compute(operation);
    }
  }

  compute(operation = null) {
    let result;
    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentOperand);

    switch (operation || this.operation) {
      case '+':
        result = prev + current;
        break
      case '-':
        result = prev - current;
        break
      case '*':
        result = prev * current;
        break
      case '÷':
        result = prev / current;
        break
      case '^':
        result = prev ** current;
        break;
      case '√':
        if (prev < 0) {
          this.isError = true;
        } else {
          result = Math.sqrt(prev);
          this.isSingleOperator = true;
        }
        break;
      default:
        return;
    }

    this.readyToReset = true;
    this.currentOperand = (result)
      ? '' + +result.toFixed(10)
      : '0';
    this.operation = undefined;
    this.previousOperand = '';
  }

  getDisplayNumber(number) {
    if (this.isError)
      return 'ERROR';

    const stringNumber = number.toString()
    const integerDigits = parseFloat(stringNumber.split('.')[0])
    const decimalDigits = stringNumber.split('.')[1]

    let integerDisplay = (!isNaN(integerDigits))
      ? integerDigits.toLocaleString('en', {maximumFractionDigits: 0})
      : '';

    return (decimalDigits != null)
      ? `${integerDisplay}.${decimalDigits}`
      : integerDisplay;
  }

  updateDisplay() {
    this.currentOperandTextElement.innerText =
      this.getDisplayNumber(this.currentOperand)
    if (this.operation != null || this.isSingleOperator) {
      this.previousOperandTextElement.innerText =
        `${this.getDisplayNumber(this.previousOperand)} ${this.operation || ''}`
    } else {
      this.previousOperandTextElement.innerText = ''
    }
  }
}


const numberButtons = document.querySelectorAll('[data-number]');
const operationButtons = document.querySelectorAll('[data-operation]');
const equalsButton = document.querySelector('[data-equals]');
const deleteButton = document.querySelector('[data-delete]');
const allClearButton = document.querySelector('[data-all-clear]');
const previousOperandTextElement = document.querySelector('[data-previous-operand]');
const currentOperandTextElement = document.querySelector('[data-current-operand]');

const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement)

numberButtons.forEach(button => {
  button.addEventListener("click", () => {
    if (calculator.previousOperand === '' && calculator.currentOperand !== '' && calculator.readyToReset)
      calculator.clear();

    calculator.appendNumber(button.innerText)
    calculator.updateDisplay();
  })
})

operationButtons.forEach(button => {
  button.addEventListener('click', () => {
    calculator.chooseOperation(button.innerText);
    calculator.updateDisplay();
  })
})

equalsButton.addEventListener('click', button => {
  calculator.compute();
  calculator.updateDisplay();
})

allClearButton.addEventListener('click', button => {
  calculator.clear();
  calculator.updateDisplay();
})

deleteButton.addEventListener('click', button => {
  calculator.delete();
  calculator.updateDisplay();
})