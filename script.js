class Calculator {
    constructor(previousOperandElement, currentOperandElement) {
        this.previousOperandElement = previousOperandElement;
        this.currentOperandElement = currentOperandElement;
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetScreen = false;
        this.currentOperandElement.classList.remove('error');
    }

    delete() {
        if (this.currentOperand === 'Error' || this.currentOperand === 'NaN') {
            this.clear();
            return;
        }
        if (this.currentOperand.length === 1 || (this.currentOperand.length === 2 && this.currentOperand.startsWith('-'))) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.toString().slice(0, -1);
        }
    }

    appendNumber(number) {
        if (this.currentOperand === 'Error' || this.currentOperand === 'NaN') this.clear();
        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }
        if (number === '.' && this.currentOperand.includes('.')) return;
        
        // Max 15 digits
        if (this.currentOperand.replace('.', '').length >= 15) return;

        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === 'Error' || this.currentOperand === 'NaN') return;
        if (this.currentOperand === '') return;
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.shouldResetScreen = true;
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        
        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '×':
            case '*':
                computation = prev * current;
                break;
            case '÷':
            case '/':
                if (current === 0) {
                    this.currentOperand = "Error";
                    this.previousOperand = "";
                    this.operation = undefined;
                    this.currentOperandElement.classList.add('error');
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }

        // Handle floating point precision
        computation = Math.round(computation * 1000000000) / 1000000000;
        
        if (!isFinite(computation)) {
            this.currentOperand = "Error";
            this.currentOperandElement.classList.add('error');
        } else {
            this.currentOperand = computation.toString();
        }
        
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetScreen = true;
    }

    updateDisplay() {
        this.currentOperandElement.innerText = this.formatDisplayNumber(this.currentOperand);
        if (this.operation != null) {
            this.previousOperandElement.innerText = `${this.formatDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandElement.innerText = '';
        }
    }

    formatDisplayNumber(number) {
        if (number === 'Error' || number === 'NaN') return number;
        
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        
        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }
        
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }
}

const previousOperandElement = document.getElementById('previous-operand');
const currentOperandElement = document.getElementById('current-operand');
const calculator = new Calculator(previousOperandElement, currentOperandElement);

// Event Listeners for UI clicks
document.querySelectorAll('.btn-number').forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.getAttribute('data-value'));
        calculator.updateDisplay();
    });
});

document.querySelectorAll('.btn-operator').forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseOperation(button.getAttribute('data-value'));
        calculator.updateDisplay();
    });
});

document.querySelector('.btn-equals').addEventListener('click', () => {
    calculator.compute();
    calculator.updateDisplay();
});

document.querySelector('[data-action="clear"]').addEventListener('click', () => {
    calculator.clear();
    calculator.updateDisplay();
});

document.querySelector('[data-action="delete"]').addEventListener('click', () => {
    calculator.delete();
    calculator.updateDisplay();
});

// Keyboard Support
document.addEventListener('keydown', e => {
    let key = e.key;
    
    if (/[0-9\.]/.test(key)) {
        e.preventDefault();
        calculator.appendNumber(key);
        calculator.updateDisplay();
        highlightButton(`[data-value="${key}"]`);
    }
    
    if (key === '+' || key === '-') {
        e.preventDefault();
        calculator.chooseOperation(key);
        calculator.updateDisplay();
        highlightButton(`[data-value="${key}"]`);
    }
    
    if (key === '*' || key === 'x') {
        e.preventDefault();
        calculator.chooseOperation('×');
        calculator.updateDisplay();
        highlightButton(`[data-value="×"]`);
    }
    
    if (key === '/') {
        e.preventDefault();
        calculator.chooseOperation('÷');
        calculator.updateDisplay();
        highlightButton(`[data-value="÷"]`);
    }
    
    if (key === 'Enter' || key === '=') {
        e.preventDefault();
        calculator.compute();
        calculator.updateDisplay();
        highlightButton(`[data-action="calculate"]`);
    }
    
    if (key === 'Backspace') {
        e.preventDefault();
        calculator.delete();
        calculator.updateDisplay();
        highlightButton(`[data-action="delete"]`);
    }
    
    if (key === 'Escape') {
        e.preventDefault();
        calculator.clear();
        calculator.updateDisplay();
        highlightButton(`[data-action="clear"]`);
    }
});

function highlightButton(selector) {
    const button = document.querySelector(selector);
    if (button) {
        button.classList.add('keyboard-active');
        setTimeout(() => {
            button.classList.remove('keyboard-active');
        }, 150);
    }
}
