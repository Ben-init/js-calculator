const resultMain = document.getElementById('result');
const keypad = document.getElementById('keypad');

let mainExpression = [];
let isOperator = false;


keypad.addEventListener('click', (event) => {
    const target = event.target;

    if (target.tagName != 'BUTTON') {
        return;
    }

    const value = target.dataset.value;
    const type = target.dataset.type;


    switch (type) {
        case 'number':
        case 'operator':
            handleUserInput(value);
            break;
        
        case 'clear':
            clearAll();
            break;
        
        case 'equals':
            updateDisplay();
            break;

        case 'delete':
            handleDeleteInput();
            break;
    }
});

function handleUserInput(value) {
    let isInputOperator = identifyOperator(value)[1];

    if (isInputOperator) {
        let isSuccessful = handleOperatorInput(value, mainExpression);
        //funcion pendiente para avisar al usuario que la entrada es invalida
        //'isSuccessful' retorna true en caso de haberse concretado o false si no
        //if (!isSuccessful) console.log('invalid input');
    } else {
        let isSuccessful = handleNumberInput(value, mainExpression);
        //funcion pendiente para avisar al usuario que la entrada es invalida 
        //'isSuccessful' retorna true en caso de haberse concretado o false si no
        //if (!isSuccessful) console.log('invalid input');
    }

    const displayValue = formatExpressionForDisplay(mainExpression);

    if (mainExpression.length === 0) {
         updateDisplay('0');
    } else {
         updateDisplay(displayValue);
    }
}

function handleDeleteInput() {
    if (mainExpression.length === 0) return;

    let lastIndex = mainExpression.length - 1;
    let lastElement = mainExpression[lastIndex];

    if (isOperator) {
        mainExpression.pop();
    } else {
        if (lastElement.length === 1) {
            mainExpression.pop();
        } else {
            mainExpression[lastIndex] = lastElement.slice(0, -1);
        }
    }

    if (!mainExpression.length) {
        updateDisplay('0');
    } else {
        updateDisplay(formatExpressionForDisplay(mainExpression));
    }
    
    lastIndex = mainExpression.length - 1;
    let operatorInfo = identifyOperator(mainExpression[lastIndex]);

    isOperator = operatorInfo[1];
}

function formatExpressionForDisplay(tokens) {
    const displayString = tokens.join(' ');
    const finalDisplay = displayString.replace(/\*/g, 'x');

    return finalDisplay;
}

function updateDisplay(data) {
    if (!mainExpression.length && !data) {
        data = '0';
    }

    const contentToDisplay = data ? data: processByPrecedence(mainExpression);
    resultMain.textContent = contentToDisplay;
}

function clearAll() {
    resultMain.textContent = '0'
    mainExpression = [];
    isOperator = false;
}

function handleOperatorInput(operator, expressionArray) {
    let expressionLength = expressionArray.length;
    let negativeChecker = isNegativeSign(operator);

    if (isOperator && expressionLength) {
        expressionArray.pop();
        expressionArray.push(operator);
    } else if (negativeChecker && !expressionLength){
        expressionArray.push(operator);
    } else if (expressionLength) {
        expressionArray.push(operator);
    } else {
        return false;
    }

    isOperator = true;

    return true;
}

function isNegativeSign(operator) {
    return (operator === '-')? true: false;
}

function handleNumberInput(number, expressionArray) {
    let expressionLength = expressionArray.length;

    if (!expressionLength) {
        expressionArray.push(number);
    } else if (!isOperator && expressionLength) {
        appendDigit(expressionArray, number);
    } else if (isOperator && expressionLength > 1) {
        expressionArray.push(number);
    } else if (isOperator && expressionLength === 1) {
        appendDigit(expressionArray, number);
    } else {
        return false;
    }

    isOperator = false;

    return true;
}

function appendDigit(expressionArray, number) {
    expressionArray.push(expressionArray.pop() + number);
}

function processByPrecedence(expressionArray, precedenceLevel = 3) {
    let outputStack = [];
    let index = 0;

    while (index < expressionArray.length) {
        let operatorInfo = identifyOperator(expressionArray[index]);

        if ( (!operatorInfo[1]) || (operatorInfo[0] != precedenceLevel) ) {
            outputStack.push(expressionArray[index]);
            index += 1;
        } else if ( (operatorInfo[1]) && (operatorInfo[0] == precedenceLevel) ) {
            let partialResult =  calculate(expressionArray[index], outputStack.pop(), expressionArray[index + 1]);
            outputStack.push(partialResult);
            index += 2;
        }
    }

    if (precedenceLevel > 0) {
        outputStack = processByPrecedence(outputStack, precedenceLevel - 1);
    }

    return outputStack;
}

function calculate(operacion, a, b) {
    a = +a;
    b = +b;

    switch (operacion) {
        case '**':
            return a ** b;

        case '*':
            return a * b;

        case '/':
            return a / b;

        case '+':
            return a + b;
            
        case '-':
            return a - b;
    }
}

function identifyOperator(operator) {
        switch(operator) {
            case '**':
            case '//':
                return [3, true];

            case '*':
            case '/':
                return [2, true];

            case '+': 
            case '-':
                return [1, true];

            default:
                return [0, false];
    } 
}