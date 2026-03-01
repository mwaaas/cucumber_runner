# Cucumber Scenario Runner

A Visual Studio Code extension that allows you to run Cucumber scenarios directly from the editor with a single click. This extension integrates with the official [Cucumber extension](https://marketplace.visualstudio.com/items?itemName=CucumberOpen.cucumber-official) and uses its configuration.

## Features

- **▶ Run Icons**: Click the play button next to any `Scenario` or `Scenario Outline` to run it
- **Run Feature**: Click the play button next to `Feature` to run all scenarios in the file
- **🐛 Debug**: Debug scenarios with breakpoints support
- **Context Menu**: Right-click on a scenario to run or debug it
- **Uses Official Cucumber Configuration**: Automatically reads `cucumber.glue` and other settings from the official Cucumber extension

## Prerequisites

This extension requires the official Cucumber extension to be installed:
- [Cucumber (Official)](https://marketplace.visualstudio.com/items?itemName=CucumberOpen.cucumber-official)

The extension will automatically prompt you to install it if not present.

## Usage

1. Open a `.feature` file
2. You'll see `▶ Run` and `🐛 Debug` buttons above each scenario
3. Click `▶ Run` to execute the scenario
4. Click `🐛 Debug` to debug the scenario with breakpoints

### Running from Title Bar

When viewing a `.feature` file, you can click the play button in the editor title bar to run the entire feature file.

### Running from Context Menu

Right-click anywhere within a scenario to access:
- **Run Cucumber Scenario**: Execute the current scenario
- **Debug Cucumber Scenario**: Debug the current scenario

## Configuration

This extension uses the configuration from the official Cucumber extension:

| Setting | Description |
|---------|-------------|
| `cucumber.features` | Glob pattern for feature files |
| `cucumber.glue` | Glob patterns for step definition files |
| `cucumber.parameterTypes` | Custom parameter types |

### Additional Settings

| Setting | Description | Default |
|---------|-------------|---------|
| `cucumberRunner.runInTerminal` | Run scenarios in integrated terminal | `true` |
| `cucumberRunner.cwd` | Working directory relative to workspace root | `""` |
| `cucumberRunner.commandTemplate` | Custom command template (see below) | `""` |

### Monorepo / Subdirectory Setup

If your Cucumber project is in a subdirectory (common in monorepos), set the `cucumberRunner.cwd` setting:

```json
{
  "cucumberRunner.cwd": "cucumber"
}
```

This tells the extension to:
1. Run commands from the `cucumber` subdirectory
2. Use the `node_modules` from that subdirectory
3. Calculate feature file paths relative to that directory

**Example**: If your project structure is:
```
my-project/
├── backend/
├── frontend/
└── cucumber/           ← Cucumber tests here
    ├── package.json
    ├── node_modules/
    └── features/
        └── account.feature
```

Add to `.vscode/settings.json`:
```json
{
  "cucumberRunner.cwd": "cucumber",
  "cucumber.glue": [
    "features/step_definitions/**/*.js",
    "features/support/**/*.js"
  ]
}
```

### Custom Command Template

For advanced use cases, you can specify a custom command template:

```json
{
  "cucumberRunner.commandTemplate": "npm run test -- {featurePath}:{line}"
}
```

Use `{featurePath}` for the feature file path and `{line}` for the line number.

### Example Cucumber Configuration

In your VS Code settings or `.vscode/settings.json`:

```json
{
  "cucumber.features": ["features/**/*.feature"],
  "cucumber.glue": [
    "features/step_definitions/**/*.js",
    "features/support/**/*.js"
  ]
}
```

## Requirements

- VS Code 1.74.0 or higher
- [Cucumber (Official)](https://marketplace.visualstudio.com/items?itemName=CucumberOpen.cucumber-official) extension
- A Cucumber implementation installed in your project (cucumber-js)

## Installation

### From VSIX

1. Download the `.vsix` file
2. Open VS Code
3. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
4. Click the three dots menu (...)
5. Select "Install from VSIX..."
6. Choose the downloaded file

### From Source

```bash
git clone <repository-url>
cd cucumber-scenario-runner
npm install
npm run compile
npm run package
```

Then install the generated `.vsix` file.

## Commands

| Command | Description |
|---------|-------------|
| `Cucumber Runner: Run Scenario` | Run the scenario at cursor position |
| `Cucumber Runner: Run Feature` | Run all scenarios in the current feature file |
| `Cucumber Runner: Debug Scenario` | Debug the scenario at cursor position |

## Keyboard Shortcuts

You can add custom keyboard shortcuts in VS Code:

```json
{
  "key": "ctrl+shift+r",
  "command": "cucumber-runner.runScenario",
  "when": "resourceExtname == .feature"
}
```

## Supported Gherkin Keywords

- `Feature:`
- `Scenario:`
- `Scenario Outline:`

## How It Works

1. The extension reads your `cucumber.glue` configuration from the official Cucumber extension
2. When you click Run, it constructs the appropriate `npx cucumber-js` command
3. The command is executed in the integrated terminal with the correct `--require` paths

## Known Issues

- Debug configuration is optimized for Node.js-based Cucumber (cucumber-js)
- For other Cucumber implementations, you may need to customize the run command

### ⚠️ Important: Cucumber Config File Warning

If your `cucumber.js` (or `cucumber.cjs`) config file has a default profile with `paths` defined, **it will run ALL matching scenarios** instead of just the one you clicked on:

```javascript
// cucumber.js - This will cause issues!
module.exports = {
  default: {
    paths: ["features/**/*.feature"],  // ⚠️ This overrides the specific scenario
    require: ["features/step_definitions/**/*.js"],
    format: ["progress-bar", "html:reports/report.html"]
  }
}
```

**Solution:** Remove the `paths` property from your default profile:

```javascript
// cucumber.js - Fixed version
module.exports = {
  default: {
    require: ["features/step_definitions/**/*.js"],
    format: ["progress-bar", "html:reports/report.html"]
    // No 'paths' here - let the CLI argument specify which feature to run
  }
}
```

Alternatively, create a separate profile for running all tests:

```javascript
// cucumber.js - With separate profiles
module.exports = {
  default: {
    // Used by extension - no paths, uses CLI argument
    require: ["features/step_definitions/**/*.js"],
    format: ["progress-bar"]
  },
  all: {
    // Used for running all tests: npx cucumber-js --profile all
    paths: ["features/**/*.feature"],
    require: ["features/step_definitions/**/*.js"],
    format: ["progress-bar", "html:reports/report.html"]
  }
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Release Notes

### 1.0.0

- Initial release
- Run and debug scenarios with CodeLens buttons
- Integration with official Cucumber extension configuration
- Support for `cucumber.glue` setting for step definitions