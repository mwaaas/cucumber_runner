import * as vscode from 'vscode';
import { CucumberCodeLensProvider } from './codeLensProvider';
import { ScenarioRunner } from './scenarioRunner';

export function activate(context: vscode.ExtensionContext) {
    console.log('Cucumber Scenario Runner is now active!');

    const scenarioRunner = new ScenarioRunner();
    const codeLensProvider = new CucumberCodeLensProvider();

    // Register CodeLens provider for .feature files
    // The official Cucumber extension uses 'cucumber' language ID
    const codeLensDisposable = vscode.languages.registerCodeLensProvider(
        { language: 'cucumber', scheme: 'file' },
        codeLensProvider
    );

    // Register run scenario command
    const runScenarioCommand = vscode.commands.registerCommand(
        'cucumber-runner.runScenario',
        async (filePath?: string, lineNumber?: number) => {
            const editor = vscode.window.activeTextEditor;
            
            if (filePath && lineNumber !== undefined) {
                await scenarioRunner.runScenario(filePath, lineNumber);
            } else if (editor) {
                const document = editor.document;
                const position = editor.selection.active;
                const scenarioLine = findScenarioLine(document, position.line);
                
                if (scenarioLine !== -1) {
                    await scenarioRunner.runScenario(document.fileName, scenarioLine + 1);
                } else {
                    vscode.window.showWarningMessage('No scenario found at current position');
                }
            }
        }
    );

    // Register run feature command
    const runFeatureCommand = vscode.commands.registerCommand(
        'cucumber-runner.runFeature',
        async () => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                await scenarioRunner.runFeature(editor.document.fileName);
            }
        }
    );

    // Register debug scenario command
    const debugScenarioCommand = vscode.commands.registerCommand(
        'cucumber-runner.debugScenario',
        async (filePath?: string, lineNumber?: number) => {
            const editor = vscode.window.activeTextEditor;
            
            if (filePath && lineNumber !== undefined) {
                await scenarioRunner.debugScenario(filePath, lineNumber);
            } else if (editor) {
                const document = editor.document;
                const position = editor.selection.active;
                const scenarioLine = findScenarioLine(document, position.line);
                
                if (scenarioLine !== -1) {
                    await scenarioRunner.debugScenario(document.fileName, scenarioLine + 1);
                } else {
                    vscode.window.showWarningMessage('No scenario found at current position');
                }
            }
        }
    );

    context.subscriptions.push(
        codeLensDisposable,
        runScenarioCommand,
        runFeatureCommand,
        debugScenarioCommand
    );
}

function findScenarioLine(document: vscode.TextDocument, currentLine: number): number {
    const scenarioRegex = /^\s*(Scenario|Scenario Outline):/i;
    
    // Search upward from current line to find scenario
    for (let i = currentLine; i >= 0; i--) {
        const lineText = document.lineAt(i).text;
        if (scenarioRegex.test(lineText)) {
            return i;
        }
        // Stop if we hit a Feature line (we've gone too far)
        if (/^\s*Feature:/i.test(lineText)) {
            break;
        }
    }
    return -1;
}

export function deactivate() {}