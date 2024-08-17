"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(src_exports);
var import_vscode4 = require("vscode");

// src/core/insert.ts
var import_vscode2 = require("vscode");

// src/utils.ts
var import_vscode = require("vscode");
function getConfiguration(configKey) {
  return import_vscode.workspace.getConfiguration("something-for-console").get(configKey);
}
function getIndentsByLineNumber(document, lineNumber) {
  const { text, firstNonWhitespaceCharacterIndex } = document.lineAt(lineNumber);
  return text.substring(0, firstNonWhitespaceCharacterIndex);
}
function getDebuggerStatementByLanguage(document) {
  const wrappers = getConfiguration("wrappers");
  return wrappers[document.languageId] || wrappers.default;
}
function getInsertTextByLanguage({ document, text, indents, lineNumber }) {
  const statement = getDebuggerStatementByLanguage(document);
  const content = text.trim().replace(/\r\n/g, ",");
  return `${indents}${statement.replace(/%s/gu, content.replace(/(\"|'|`)/gu, "\\$1")).replace(/\$line/gu, `${lineNumber + 1}`).replace(/\$text/gu, content)}\r
`;
}
function getTargetLineByLineNumber(document, lineNumber, arrow) {
  if (arrow === "before" && lineNumber === 0) {
    return 0;
  } else if (arrow === "after" && lineNumber !== document.lineCount - 1) {
    return lineNumber + 1;
  }
  return lineNumber;
}

// src/core/insert.ts
async function insertVariableLogger(arrow) {
  const { selection, document } = this;
  new Promise((resolve, reject) => {
    const insertLine = document.lineAt(selection.end.line);
    const range = selection.end.character - selection.start.character ? new import_vscode2.Range(selection.start, selection.end) : this.document.getWordRangeAtPosition(selection.anchor);
    if (!range && insertLine.isEmptyOrWhitespace) {
      return resolve({ lineNumber: insertLine.lineNumber, text: "" });
    } else if (!range) {
      return reject(new Error("No selection or word found."));
    }
    resolve({ lineNumber: range.end.line, text: document.getText(range) });
  }).then(({ lineNumber, text }) => {
    const indents = getIndentsByLineNumber(document, lineNumber);
    const insertLineNumber = getTargetLineByLineNumber(document, lineNumber, arrow);
    this.edit(async (editor) => {
      editor.insert(
        new import_vscode2.Position(insertLineNumber, 0),
        getInsertTextByLanguage({ document, indents, lineNumber, text })
      );
      await Promise.resolve();
      getConfiguration("autoSave") && document.save();
    });
  }).catch((error) => {
    import_vscode2.window.showInformationMessage(error.message);
  });
}
var insert_default = insertVariableLogger;

// src/core/remove.ts
var import_vscode3 = require("vscode");
async function removeInsertedLogger() {
  const { document } = this;
  const statementRanges = getAllStatementsByDocument(document);
  if (!statementRanges.length) {
    import_vscode3.window.showInformationMessage("No logger statement found.");
    return;
  }
  const workspaceEdit = new import_vscode3.WorkspaceEdit();
  statementRanges.forEach((statement) => {
    workspaceEdit.delete(document.uri, statement);
  });
  await import_vscode3.workspace.applyEdit(workspaceEdit);
  getConfiguration("autoSave") && document.save();
  import_vscode3.window.showInformationMessage("Remove all logger success.");
}
function getAllStatementsByDocument(document) {
  const content = document.getText();
  const regexp = new RegExp(
    `${getDebuggerStatementByLanguage(document).replace(/\./g, "\\.").replace(/\(.*?\)/, "\\(.*?\\)")}\\s*;?\\s*`,
    "gm"
  );
  const statements = [];
  let match, range;
  do {
    match = regexp.exec(content);
    if (!match) {
      continue;
    }
    range = document.lineAt(document.positionAt(match.index)).range;
    !range.isEmpty && statements.push(range);
  } while (match);
  return statements;
}
var remove_default = removeInsertedLogger;

// src/index.ts
function activate() {
  if (!import_vscode4.window.activeTextEditor) {
    return;
  }
  import_vscode4.commands.registerTextEditorCommand(
    "something-for-console.wrapper",
    (ctx) => insert_default.call(ctx, "after")
  );
  import_vscode4.commands.registerTextEditorCommand(
    "something-for-console.wrapper.before",
    (ctx) => insert_default.call(ctx, "before")
  );
  import_vscode4.commands.registerTextEditorCommand(
    "something-for-console.wrapper.remove",
    (ctx) => remove_default.call(ctx)
  );
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
