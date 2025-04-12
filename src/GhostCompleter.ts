import type { InlineCompletionItem } from 'vscode-languageserver-types'
import { lspRangeToRange, rangeToLspRange } from './helpers'

class GhostCompleter {
  private editor: TextEditor

  constructor(editor: TextEditor) {
    this.editor = editor
  }

  async apply(completion: InlineCompletionItem) {
    const { document, selectedRange } = this.editor
    const { start } = selectedRange
    const { insertText, range } = completion
    const positionRange = rangeToLspRange(document, selectedRange)
    if (!positionRange) return

    const { character } = positionRange.end

    if (!range) return

    const replaceRange = lspRangeToRange(document, range)
    const typedText = document.getTextInRange(
      new Range(start - character, start),
    )
    const remainingText = (insertText as string).slice(typedText.length)

    await this.editor.edit((edit) =>
      edit.replace(
        replaceRange,
        insertText as string,
        InsertTextFormat.Snippet,
      ),
    )
    this.editor.startShadowTyping([
      new Range(start, start + remainingText.length),
    ])
  }
}

export default GhostCompleter
