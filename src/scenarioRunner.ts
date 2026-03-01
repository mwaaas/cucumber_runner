import * as vscode from 'vscode';
import * as path from 'path';

export class ScenarioRunner {
    private terminal: vscode.Terminal | undefined;
    private outputChannel: vscode.OutputChannel;

    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('Cucumber Runner');
    }

    public async runScenario(filePath: string, lineNumber: number): Promise<void> {
        const runnerConfig = vscode.workspace.getConfiguration('cucumberRunner');
        const runInTerminal = runnerConfig.get<boolean>('runInTerminal', true);
        const cwdRelative = runnerConfig.get<string>('cwd', '');
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        
        // Calculate the effective working directory
        const effectiveCwd = workspaceFolder 
            ? (cwdRelative ? path.join(workspaceFolder.uri.fsPath, cwdRelative) : workspaceFolder.uri.fsPath)
            : undefined;
        
        // Calculate relative path from the effective cwd
        const relativePath = effectiveCwd 
            ? path.relative(effectiveCwd, filePath)
            : filePath;

        const command = this.buildRunCommand(relativePath, lineNumber);

        if (runInTerminal) {
            await this.executeInTerminal(command, effectiveCwd);
        } else {
            await this.executeInOutput(command, effectiveCwd);
        }
    }

    public async runFeature(filePath: string): Promise<void> {
        const runnerConfig = vscode.workspace.getConfiguration('cucumberRunner');
        const runInTerminal = runnerConfig.get<boolean>('runInTerminal', true);
        const cwdRelative = runnerConfig.get<string>('cwd', '');
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        
        // Calculate the effective working directory
        const effectiveCwd = workspaceFolder 
            ? (cwdRelative ? path.join(workspaceFolder.uri.fsPath, cwdRelative) : workspaceFolder.uri.fsPath)
            : undefined;
        
        // Calculate relative path from the effective cwd
        const relativePath = effectiveCwd 
            ? path.relative(effectiveCwd, filePath)
            : filePath;

        const command = this.buildRunCommand(relativePath);

        if (runInTerminal) {
            await this.executeInTerminal(command, effectiveCwd);
        } else {
            await this.executeInOutput(command, effectiveCwd);
        }
    }

    public async debugScenario(filePath: string, lineNumber: number): Promise<void> {
        const runnerConfig = vscode.workspace.getConfiguration('cucumberRunner');
        const cwdRelative = runnerConfig.get<string>('cwd', '');
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder found for debugging');
            return;
        }

        // Calculate the effective working directory
        const effectiveCwd = cwdRelative 
            ? path.join(workspaceFolder.uri.fsPath, cwdRelative) 
            : workspaceFolder.uri.fsPath;
        
        // Calculate relative path from the effective cwd
        const relativePath = path.relative(effectiveCwd, filePath);
        const cucumberConfig = vscode.workspace.getConfiguration('cucumber');
        
        // Get glue paths from official Cucumber extension config
        const glue = cucumberConfig.get<string[]>('glue', ['features/**/*.js', 'features/**/*.ts', 'step_definitions/**/*.js', 'step_definitions/**/*.ts']);

        // Build the path to cucumber-js relative to the effective cwd
        const cucumberBinPath = cwdRelative 
            ? `\${workspaceFolder}/${cwdRelative}/node_modules/.bin/cucumber-js`
            : '${workspaceFolder}/node_modules/.bin/cucumber-js';
        
        const debugCwd = cwdRelative 
            ? `\${workspaceFolder}/${cwdRelative}`
            : '${workspaceFolder}';

        // Create a debug configuration that uses Cucumber extension settings
        const debugConfig: vscode.DebugConfiguration = {
            type: 'node',
            request: 'launch',
            name: 'Debug Cucumber Scenario',
            program: cucumberBinPath,
            args: this.buildDebugArgs(relativePath, lineNumber, glue, cwdRelative),
            cwd: debugCwd,
            console: 'integratedTerminal',
            internalConsoleOptions: 'neverOpen'
        };

        try {
            await vscode.debug.startDebugging(workspaceFolder, debugConfig);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to start debugging: ${error}`);
        }
    }

    private buildRunCommand(featurePath: string, lineNumber?: number): string {
        const cucumberConfig = vscode.workspace.getConfiguration('cucumber');
        const runnerConfig = vscode.workspace.getConfiguration('cucumberRunner');
        
        // Get settings from official Cucumber extension
        const glue = cucumberConfig.get<string[]>('glue', []);
        const cwdRelative = runnerConfig.get<string>('cwd', '');
        const profile = runnerConfig.get<string>('profile', '');
        
        // Check for custom command template first
        const customCommand = runnerConfig.get<string>('commandTemplate', '');
        
        if (customCommand) {
            // Use custom command template
            let command = customCommand
                .replace('{featurePath}', featurePath)
                .replace('{line}', lineNumber?.toString() || '');
            return command;
        }
        
        // Build the cucumber-js command using npx @cucumber/cucumber
        // This ensures we use the correct package, not a placeholder
        const parts: string[] = ['npx', '@cucumber/cucumber'];
        
        // Add feature path with optional line number - this MUST come first
        if (lineNumber !== undefined) {
            parts.push(`"${featurePath}:${lineNumber}"`);
        } else {
            parts.push(`"${featurePath}"`);
        }
        
        // Add require paths from glue configuration
        // Adjust paths based on cwd - if glue paths start with the cwd prefix, remove it
        if (glue.length > 0) {
            for (const gluePath of glue) {
                let adjustedPath = gluePath;
                
                // If cwd is set and the glue path starts with it, remove the prefix
                if (cwdRelative) {
                    const cwdPrefix = cwdRelative.endsWith('/') ? cwdRelative : cwdRelative + '/';
                    if (gluePath.startsWith(cwdPrefix)) {
                        adjustedPath = gluePath.substring(cwdPrefix.length);
                    } else if (gluePath.startsWith(cwdRelative + '/')) {
                        adjustedPath = gluePath.substring(cwdRelative.length + 1);
                    }
                }
                
                parts.push('--require', `"${adjustedPath}"`);
            }
        }
        
        // Add format for better output
        parts.push('--format', 'progress-bar');
        
        // Handle profile configuration
        // If profile is set to a specific value, use that profile
        if (profile) {
            parts.push('--profile', profile);
        }
        
        return parts.join(' ');
    }

    private buildDebugArgs(featurePath: string, lineNumber: number, glue: string[], cwdRelative: string): string[] {
        const args: string[] = [];
        
        // Add feature path with line number
        args.push(`${featurePath}:${lineNumber}`);
        
        // Add require paths from glue configuration
        // Adjust paths based on cwd - if glue paths start with the cwd prefix, remove it
        for (const gluePath of glue) {
            let adjustedPath = gluePath;
            
            // If cwd is set and the glue path starts with it, remove the prefix
            if (cwdRelative) {
                const cwdPrefix = cwdRelative.endsWith('/') ? cwdRelative : cwdRelative + '/';
                if (gluePath.startsWith(cwdPrefix)) {
                    adjustedPath = gluePath.substring(cwdPrefix.length);
                } else if (gluePath.startsWith(cwdRelative + '/')) {
                    adjustedPath = gluePath.substring(cwdRelative.length + 1);
                }
            }
            
            args.push('--require', adjustedPath);
        }
        
        // Add format
        args.push('--format', 'progress');
        
        return args;
    }

    private async executeInTerminal(command: string, cwd?: string): Promise<void> {
        // Reuse existing terminal or create new one
        if (!this.terminal || this.terminal.exitStatus !== undefined) {
            this.terminal = vscode.window.createTerminal({
                name: 'Cucumber Runner',
                cwd: cwd
            });
        }

        this.terminal.show();
        this.terminal.sendText(command);
    }

    private async executeInOutput(command: string, cwd?: string): Promise<void> {
        const { exec } = require('child_process');
        
        this.outputChannel.show();
        this.outputChannel.appendLine(`> ${command}`);
        this.outputChannel.appendLine('');

        return new Promise((resolve) => {
            exec(command, { cwd }, (error: Error | null, stdout: string, stderr: string) => {
                if (stdout) {
                    this.outputChannel.appendLine(stdout);
                }
                if (stderr) {
                    this.outputChannel.appendLine(stderr);
                }
                if (error) {
                    this.outputChannel.appendLine(`Error: ${error.message}`);
                }
                this.outputChannel.appendLine('');
                this.outputChannel.appendLine('--- Execution completed ---');
                resolve();
            });
        });
    }

    public dispose(): void {
        this.terminal?.dispose();
        this.outputChannel.dispose();
    }
}