"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("./helpers");
class GhostCompleter {
    constructor(editor) {
        this.editor = editor;
    }
    apply(completion) {
        return __awaiter(this, void 0, void 0, function* () {
            const { document, selectedRange } = this.editor;
            const { start } = selectedRange;
            const { insertText, range } = completion;
            const positionRange = (0, helpers_1.rangeToLspRange)(document, selectedRange);
            if (!positionRange)
                return;
            const { character } = positionRange.end;
            if (!range)
                return;
            const replaceRange = (0, helpers_1.lspRangeToRange)(document, range);
            const typedText = document.getTextInRange(new Range(start - character, start));
            const remainingText = insertText.slice(typedText.length);
            yield this.editor.edit((edit) => edit.replace(replaceRange, insertText, InsertTextFormat.Snippet));
            this.editor.startShadowTyping([
                new Range(start, start + remainingText.length),
            ]);
        });
    }
}
exports.default = GhostCompleter;
