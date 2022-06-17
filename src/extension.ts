// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { posix } from 'path';
import { camelCase } from "camel-case";

const commandId = "i18n-arb-helper.extractStringToARB";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider('dart', new ExtractStringQuickFix(), {
			providedCodeActionKinds: ExtractStringQuickFix.providedCodeActionKinds
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(commandId, (args) => {
			console.log("run command " + commandId);
			extractStringToARB(args);
		})
	);
}

export class ExtractStringQuickFix implements vscode.CodeActionProvider {
	public static readonly providedCodeActionKinds = [
		vscode.CodeActionKind.RefactorExtract,
		vscode.CodeActionKind.RefactorRewrite,
		vscode.CodeActionKind.SourceOrganizeImports,
	];

	provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
		if (range.isEmpty) { return; }

		const extract = new vscode.CodeAction(`Extract to app_fr.arb`, vscode.CodeActionKind.RefactorExtract);
		// extract.edit = new vscode.WorkspaceEdit();

		extract.command = {
			title: "Extract to app_fr.arb",
			command: commandId,
			arguments: [{ document, range, edit: new vscode.WorkspaceEdit() }],
		};

		return [extract];
	}
}

// this method is called when your extension is deactivated
export function deactivate() { }

async function extractStringToARB(args: any) {

	// let { document, range, edit }: { document: vscode.TextDocument, range: vscode.Range | vscode.Selection, edit: vscode.WorkspaceEdit } = args;

	const editor = vscode.window.activeTextEditor;

	if (!editor) { return; }

	const document = editor.document;
	const selection = editor.selection;

	if (!selection) { return; }

	// Get the text within the selection
	const text = document.getText(selection);

	// prompt user for translation key
	const key = await vscode.window.showInputBox({
		placeHolder: 'Enter translation key',
		title: 'Enter translation key',
	});

	if (!key) { return; }

	try {
		const translationKey = await writeToArb(key, text);
		editor.edit(editBuilder => {
			editBuilder.replace(selection, `wrapL10n(transl.${translationKey})`);
		});
	} catch (error) {
		console.error("unable to write to arb file", error);
	}
}

async function writeToArb(key: string, text: string): Promise<string> {
	if (!vscode.workspace.workspaceFolders) {
		vscode.window.showInformationMessage('No folder or workspace opened');
		throw new Error("No folder or workspace opened");
	}

	const folderUri = vscode.workspace.workspaceFolders[0].uri;
	const fileUri = folderUri.with({ path: posix.join(folderUri.path, '/lib/l10n/app_fr.arb') });

	const readData = await vscode.workspace.fs.readFile(fileUri);
	const readStr = Buffer.from(readData).toString('utf8');
	const readJson = JSON.parse(readStr);

	let translated = text.trim();

	if (/^('|").*('|")$/.test(translated)) {
		translated = translated.substring(1, translated.length - 1);
	}

	const existingKey = getExistingTranslationKey(readJson, translated);

	if (existingKey) {
		return existingKey;
	}

	const newKey = camelCase(key);

	if (readJson.hasOwnProperty(newKey)) {
		vscode.window.showInformationMessage('This key already exists in the arb file');
		throw new Error("This key already exists in the arb file");
	}

	let newData: Map<string, any> = {
		[newKey]: translated,
		[`@${newKey}`]: {
			"description": translated,
			"type": "String",
			"context": "",
		},
		...readJson,
	};

	const list = Object.entries(newData);

	list.sort(sortByKey);
	// sort again to make sure the keys are in the same order as in the arb file
	list.sort(sortByKey);

	let writeJson = Object.fromEntries(new Map(list));
	const stringData = JSON.stringify(writeJson, replacer, 2);

	const writeData = Buffer.from(stringData);
	await vscode.workspace.fs.writeFile(fileUri, writeData);

	return newKey;
}

const replacer = function (k: string, v: any) { if (v === undefined) { return null; } return v; };

const sortByKey = (a: any, b: any) => {
	if (a[0].replace(/^@/, "") === b[0].replace(/^@/, "")) {
		return -1;
	}
	return a[0].replace(/^@/, "").localeCompare(b[0].replace(/^@/, ""));
};

const getExistingTranslationKey = (map: Map<string, any>, searchValue: string) => {
	(async () => {
		for (const [key, value] of Object.entries(map)) {
			if ((typeof value === 'string') && value.includes(searchValue)) {
				vscode.window.showInformationMessage('This text has a partial match in the arb file');
			}
		}
	})();

	for (let [key, value] of Object.entries(map)) {
		if (value === searchValue) { return key; }
	}
};