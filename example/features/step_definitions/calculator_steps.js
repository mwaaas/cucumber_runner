const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');

let calculator = {
    values: [],
    result: 0
};

Given('I have entered {int} into the calculator', function (number) {
    calculator.values.push(number);
});

When('I press add', function () {
    calculator.result = calculator.values.reduce((a, b) => a + b, 0);
    calculator.values = [];
});

When('I press subtract', function () {
    calculator.result = calculator.values[0] - calculator.values.slice(1).reduce((a, b) => a + b, 0);
    calculator.values = [];
});

Then('the result should be {int} on the screen', function (expected) {
    assert.strictEqual(calculator.result, expected);
});