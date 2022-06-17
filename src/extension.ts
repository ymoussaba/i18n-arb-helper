// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { posix } from 'path';
import { camelCase } from "camel-case";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const commandId = "i18n-arb-helper.extractStringToARB";

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "i18n-arb-helper" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	// let disposable = vscode.commands.registerCommand('i18n-arb-helper.helloWorld', () => {
	// The code you place here will be executed every time your command is executed
	// Display a message box to the user
	// 	vscode.window.showInformationMessage('Hello World from Internationalization ARB Helper!');
	// });
	let disposable = vscode.commands.registerCommand('i18n-arb-helper.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Internationalization ARB Helper!');
	});

	context.subscriptions.push(disposable);

	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider('dart', new ExtractStringToARB(), {
			providedCodeActionKinds: ExtractStringToARB.providedCodeActionKinds
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('i18n-arb-helper.extractStringToARB', () => {
			ExtractStringToARB.askForTranslationKey();
		})
	);
}


export class ExtractStringToARB implements vscode.CodeActionProvider {
	public static readonly providedCodeActionKinds = [
		vscode.CodeActionKind.RefactorExtract,
		vscode.CodeActionKind.RefactorRewrite,
		vscode.CodeActionKind.SourceOrganizeImports,
	];

	provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
		if (range.isEmpty) { return; }

		const extract = this.createNewTranslation(document, range);

		return [extract];
	}

	private createNewTranslation(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction {
		const extract = new vscode.CodeAction(`Extract to app_fr.arb`, vscode.CodeActionKind.RefactorExtract);

		extract.command = {
			title: "Extract to app_fr.arb",
			command: 'i18n-arb-helper.extractStringToARB',
		};


		// vscode.commands.executeCommand('quickfix.import.async', ["import_test.dart"]);

		// extract.command = {
		// 	title: "Import dart file",
		// 	command: "quickfix.import.async",
		// 	arguments: ["lib/l10n/app_fr.arb"],
		// };

		// extract.edit = new vscode.WorkspaceEdit();
		// extract.edit.replace(document.uri, range, "app_fr.arb");
		// this.writeToArb();
		// this.askForTranslationKey();
		return extract;
	}

	// show an input box to get translation key
	static async askForTranslationKey(): Promise<void> {
		const key = await vscode.window.showInputBox({
			placeHolder: 'Enter translation key',
		});
		vscode.window.showInformationMessage(`Got key: ${key}`);
	}

	private async writeToArb(): Promise<void> {
		if (!vscode.workspace.workspaceFolders) {
			vscode.window.showInformationMessage('No folder or workspace opened');
			return;
		}

		// read arb file first
		const arbFile = vscode.workspace.workspaceFolders[0].uri.fsPath + "/lib/l10n/app_fr.arb";


		const folderUri = vscode.workspace.workspaceFolders[0].uri;
		const fileUri = folderUri.with({ path: posix.join(folderUri.path, '/lib/l10n/app_fr.arb') });

		const readData = await vscode.workspace.fs.readFile(fileUri);
		const readStr = Buffer.from(readData).toString('utf8');
		const readJson = JSON.parse(readStr);

		const writeJson = {
			"key": "value",
		};

		const writeData = Buffer.from(JSON.stringify(writeJson), 'utf8');

		await vscode.workspace.fs.writeFile(fileUri, writeData);
	}
}

// this method is called when your extension is deactivated
export function deactivate() { }
