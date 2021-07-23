function lineFormer(lexer) {
    let eof = undefined;
    return function lf() {
        if (eof) return eof;
        
        let token = lexer();
        if (token.sof) return token;
        
        let line = [];
        for(; token != "\n"; token = lexer()) {
            if (token.eof) {
                eof = token;
                break;
            }
            line.push(token);
        }
        
        if (line.length === 0 || (line.length === 1 && line[0].whitespace)) {
            // drop blank lines
            return lf();
        }

        line.push("\n");
        return line;
    };
}

function indentProcessor(lineFormer) {
    let indentStack = [];
    let lineNumber = 0;

    function topIndent() { return indentStack[indentStack.length - 1]; };

    return function indent() {
        let  line = lineFormer();
        ++lineNumber;

        if (line.sof || line.eof) {
            return line;
        }

        let indent = line[0].whitespace ? line[0].length : 0;
        let prevIndent = topIndent();

        if (prevIndent === undefined) {
            indentStack.push(indent);
        }

        if (prevIndent === undefined || indent === prevIndent) {
            return line[0].whitespace ? line.slice(1) : line;
        }
        else if (indent > prevIndent) {
            line[0] = {indent: true, depth: indentStack.length};
            indentStack.push(indent);
            return line;
        }
        else {
            while (indent < topIndent()) {
                indentStack.pop();
                if (indentStack.length == 0) {
                    throw "Pop stack out of bounds " + lineNumber;
                }
            }

            if (topIndent() != indent) {
                throw "Bad indent at line " + lineNumber;
            }
            
            let dedent = {dedent: true, depth: indentStack.length - 1};
            if (line[0].whitespace) {
                line[0] = dedent;
                return line;
            }
            else {
                line.unshift(dedent);
                return line;
            }
        }
    };
}

function lineSerializer(indentProcessor) {
    var line = indentProcessor();
    return function serialize() {
        if (line.sof || line.eof) {
            let result = line;
            line = indentProcessor();
            return result;
        }

        if (line.length == 0) {
            line = indentProcessor();
            return serialize();
        }

        return line.splice(0, 1);
    };
}

export function indenter(lexer) {
    return lineSerializer(indentProcessor(lineFormer(lexer())));
}