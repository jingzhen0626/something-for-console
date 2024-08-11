import { commands, window } from 'vscode'

import insertLogger from './core/insert'
import removeLogger from './core/remove'

export function activate() {
  if (!window.activeTextEditor) {
    return
  }

  commands.registerTextEditorCommand(
    'something-for-console.wrapper',
    ctx => insertLogger.call(ctx, 'after'),
  )

  commands.registerTextEditorCommand(
    'something-for-console.wrapper.before',
    ctx => insertLogger.call(ctx, 'before'),
  )

  commands.registerTextEditorCommand(
    'something-for-console.wrapper.remove',
    ctx => removeLogger.call(ctx),
  )
}

export function deactivate() {}
