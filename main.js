const resultMain = document.getElementById('result');
const keypad = document.getElementById('keypad');

let mainExpression = [];
let lastInputWasOperator = false;
let isResultDisplayed = false;

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
            evaluateExpression();
            break;

        case 'delete':
            handleDeleteInput();
            break;
    }
});

function handleUserInput(value) {
    const tokenMetadata = getTokenMetadata(value);
    let isSuccessful = false;

    if (tokenMetadata.isOperator) {
        if (isResultDisplayed) {
            isResultDisplayed = false; 
        }
        isSuccessful = handleOperatorInput(value, mainExpression);
    } else {
        resetOnNewInput();
        isSuccessful = handleNumberInput(value, mainExpression);
    }

    if (!isSuccessful) {
        updateDisplay('Invalid input');

        return;
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

    if (lastInputWasOperator) {
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
    let tokenMetadata = getTokenMetadata(mainExpression[lastIndex]);

    lastInputWasOperator = tokenMetadata.isOperator;
}

function formatExpressionForDisplay(tokens) {
    const displayString = tokens.join(' ');

    return displayString;
}

function resetOnNewInput() {
    if (isResultDisplayed) {
        mainExpression = []; 
        isResultDisplayed = false; 
    }
}

function evaluateExpression() {
    if(lastInputWasOperator) {
        updateDisplay('Error');

        return;
    }

    if (!mainExpression.length) {
        updateDisplay('0');

        return;
    }
    
    const finalResult = processByPrecedence(mainExpression);
    mainExpression = [finalResult.toString()];
    lastInputWasOperator = false;
    isResultDisplayed = true;
    updateDisplay(finalResult.toString());
}

function updateDisplay(data) {
    resultMain.textContent = data;
}

function clearAll() {
    updateDisplay('0');
    mainExpression = [];
    lastInputWasOperator = false;
}

function handleOperatorInput(operator, expressionArray) {
    const initialChecker = isInitialSign(operator);
    let expressionLength = expressionArray.length;

    if (lastInputWasOperator && expressionLength) {
        if (!initialChecker && expressionLength == 1) {

            return false;
        }    
        expressionArray.pop();
        expressionArray.push(operator);
    } else if (initialChecker && !expressionLength){
        expressionArray.push(operator);
    } else if (expressionLength) {
        expressionArray.push(operator);
    } else {

        return false;
    }

    lastInputWasOperator = true;

    return true;
}

function isInitialSign(operator) {
    return operator === '+' || operator === '-';
}

function handleNumberInput(number, expressionArray) {
    const expressionLength = expressionArray.length;

    if (!expressionLength) {
        expressionArray.push(number);
    } else if (!lastInputWasOperator && expressionLength) {
        appendDigit(expressionArray, number);
    } else if (lastInputWasOperator && expressionLength > 1) {
        expressionArray.push(number);
    } else if (lastInputWasOperator && expressionLength === 1) {
        appendDigit(expressionArray, number);
    } else {

        return false;
    }

    lastInputWasOperator = false;

    return true;
}

function appendDigit(expressionArray, number) {
    expressionArray.push(expressionArray.pop() + number);
}

function processByPrecedence(expressionArray, precedenceLevel = 3) {
    let outputStack = [];
    let index = 0;

    while (index < expressionArray.length) {
        let tokenMetadata = getTokenMetadata(expressionArray[index]);

        if ( (!tokenMetadata.isOperator) || (tokenMetadata.precedence != precedenceLevel) ) {
            outputStack.push(expressionArray[index]);
            index += 1;
        } else if ( (tokenMetadata.isOperator) && (tokenMetadata.precedence == precedenceLevel) ) {
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

        case '//':
            return Math.sqrt(b);

        case 'x':
            return a * b;

        case '÷':
            return a / b;

        case '+':
            return a + b;
            
        case '-':
            return a - b;
    }
}

function getTokenMetadata(token) {
    switch(token) {
        case '**':
        case '//':
            return { precedence: 3, replaceable: false, isBlock: true , isOperator: true};
        case 'x':
        case '÷':
            return { precedence: 2, replaceable: true, isBlock: false , isOperator: true};
        case '+': 
        case '-':
            return { precedence: 1, replaceable: true, isBlock: false , isOperator: true};
        default:
            return { precedence: 0, replaceable: false, isBlock: false, isOperator: false };
    } 
}