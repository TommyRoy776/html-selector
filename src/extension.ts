// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { getTagAtCursor } from './helper';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "html-selector" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('html-selector.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from html selector!');
	});

	const htmlSelector = vscode.commands.registerCommand("html-selector.selectTagBlock", () => {
		// Implementation for selecting HTML tag block
		const editor = vscode.window.activeTextEditor;
		if (!editor)
			return;
		const document = editor.document;
		const position = editor.selection.active;
		const lineText = document.lineAt(position.line).text;
		const tag = getTagAtCursor(lineText, position.character);
		if (!tag)
			return;
		const isClosing = tag.startsWith("</");
		const tagNameMatch = tag.match(/^<\/?([a-zA-Z0-9-]+)/);
		if (!tagNameMatch)
			return;

		const tagName = tagNameMatch[1];
		const text = document.getText();
		const offset = document.offsetAt(position);
		const tagStartOffset = text.lastIndexOf("<", offset);;
		const tagEndOffset = text.indexOf(">", offset);
		if (tagStartOffset === -1 || tagEndOffset === -1) return;
		let startOffset: number | undefined;
		let endOffset: number | undefined;
		const tagRegex = new RegExp(
			`<\\/?${tagName}\\b[^>]*>`,
			"gi"
		);

		if (isClosing) {
			const matches = [...text.matchAll(tagRegex)];
			let depth = 0;

			for (let i = matches.length - 1; i >= 0; i--) {
				const m = matches[i];
				if (m.index! > tagStartOffset) continue;

				const foundTag = m[0];

				if (foundTag.startsWith(`</${tagName}`)) {
					depth++;
				} else {
					depth--;
				}

				if (depth === 0) {
					startOffset = m.index!;
					endOffset = tagEndOffset + 1;
					break;
				}
			}
		} else {
			let depth = 0;
			tagRegex.lastIndex = tagStartOffset;

			let match: RegExpExecArray | null;
			while ((match = tagRegex.exec(text))) {
				const foundTag = match[0];

				if (foundTag.startsWith(`<${tagName}`)) {
					depth++;
				}
				else {
					depth--;
				}

				if (depth === 0) {
					startOffset = tagStartOffset;
					endOffset = match.index + foundTag.length;
					break;
				}
			}
		}
		if (startOffset == null || endOffset == null) return;
		const startPos = document.positionAt(startOffset);
		const endPos = document.positionAt(endOffset);
		editor.selection = new vscode.Selection(startPos, endPos);
	});

	context.subscriptions.push(disposable,htmlSelector);
}

// This method is called when your extension is deactivated
export function deactivate() { }
