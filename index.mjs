var symbols = {};
var tokens = [];
var eof = { eof: true }

function token(str) {
    tokens.push(
        function(text, i) {
            if (i + str.length > text.length) {
                return undefined;
            }
            else if (text.substring(i, i + str.length) === str) {
                return {index: i + str.length, token: str};
            }
            else {
                return undefined;
            }
        }
    );
}

token("=");

function lexer() {
    var text = document.getElementById("codeToParse").value;
    var index = 0;

    function tryTokens() {
        if (index >= text.length) {
            return {index: index, token: eof};
        }

        var results = undefined;

        for (let i = 0; i < tokens.length; ++i) {
            results = tokens[i](text, index);
            if (results) break;
        }

        return results;
    }

    return function() {
        var tokenResult = tryTokens();
        if (tokenResult) {
            index = tokenResult.index;
            return tokenResult.token;
        }
        throw [index, "Invalid token " + text[index]];
    }
}

function writeTokens(lexer) {
    var result = document.getElementById("result");
    result.value = "";
    try {
        for(let token = lexer(); !token.eof; token = lexer()) {
            result.value += token;
            result.value += " ";
        }
    }
    catch (e) {
        result.value = "Error at " + e[0] + ": " + e[1];
    }
}

document.getElementById("parse").addEventListener("click", () => writeTokens(lexer()));