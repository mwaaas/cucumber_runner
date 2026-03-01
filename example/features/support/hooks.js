const { Before, After } = require('@cucumber/cucumber');

Before(function () {
    // Reset calculator state before each scenario
    console.log('Starting scenario...');
});

After(function () {
    console.log('Scenario completed.');
});