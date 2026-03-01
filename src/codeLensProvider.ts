import * as vscode from 'vscode';

export class CucumberCodeLensProvider implements vscode.CodeLensProvider {
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

    constructor() {
        vscode.workspace.onDidChangeConfiguration(() => {
            this._onDidChangeCodeLenses.fire();
        });
    }

    public provideCodeLenses(
        document: vscode.TextDocument,
        _token: vscode.CancellationToken
    ): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
        const codeLenses: vscode.CodeLens[] = [];
        const text = document.getText();
        const lines = text.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Match Feature line
            if (/^\s*Feature:/i.test(line)) {
                const range = new vscode.Range(i, 0, i, line.length);
                
                codeLenses.push(new vscode.CodeLens(range, {
                    title: '▶ Run Feature',
                    command: 'cucumber-runner.runFeature',
                    arguments: [document.fileName]
                }));
            }
            
            // Match Scenario or Scenario Outline
            const scenarioMatch = line.match(/^\s*(Scenario|Scenario Outline):\s*(.*)$/i);
            if (scenarioMatch) {
                const range = new vscode.Range(i, 0, i, line.length);
                const scenarioName = scenarioMatch[2].trim();
                const lineNumber = i + 1; // Line numbers are 1-based for cucumber
                
                // Run button
                codeLenses.push(new vscode.CodeLens(range, {
                    title: '▶ Run',
                    tooltip: `Run scenario: ${scenarioName}`,
                    command: 'cucumber-runner.runScenario',
                    arguments: [document.fileName, lineNumber]
                }));

                // Debug button
                codeLenses.push(new vscode.CodeLens(range, {
                    title: '🐛 Debug',
                    tooltip: `Debug scenario: ${scenarioName}`,
                    command: 'cucumber-runner.debugScenario',
                    arguments: [document.fileName, lineNumber]
                }));
            }
        }

        return codeLenses;
    }

    public resolveCodeLens(
        codeLens: vscode.CodeLens,
        _token: vscode.CancellationToken
    ): vscode.CodeLens {
        return codeLens;
    }
}