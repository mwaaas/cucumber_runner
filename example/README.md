# Cucumber Runner Example

This is a sample project to test the Cucumber Scenario Runner VS Code extension.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Make sure the following VS Code extensions are installed:
   - [Cucumber (Official)](https://marketplace.visualstudio.com/items?itemName=CucumberOpen.cucumber-official)
   - Cucumber Scenario Runner (the extension we built)

## Testing the Extension

1. Open this `example` folder in VS Code as a workspace:
   ```bash
   code example
   ```

2. Open `features/calculator.feature`

3. You should see:
   - `▶ Run Feature` button above `Feature: Calculator`
   - `▶ Run` and `🐛 Debug` buttons above each `Scenario` and `Scenario Outline`

4. Click any `▶ Run` button to run that specific scenario

5. The command will execute in the integrated terminal

## Project Structure

```
example/
├── .vscode/
│   └── settings.json      # Cucumber extension configuration
├── features/
│   ├── calculator.feature # Feature file with scenarios
│   ├── step_definitions/
│   │   └── calculator_steps.js  # Step definitions
│   └── support/
│       └── hooks.js       # Before/After hooks
├── package.json
└── README.md
```

## VS Code Settings

The `.vscode/settings.json` configures the Cucumber extension:

```json
{
  "cucumber.features": ["features/**/*.feature"],
  "cucumber.glue": [
    "features/step_definitions/**/*.js",
    "features/support/**/*.js"
  ]
}
```

## Running Tests Manually

```bash
# Run all tests
npm test

# Run a specific scenario (line 7)
npx cucumber-js features/calculator.feature:7