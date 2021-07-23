import { lexer } from "./lexer.mjs";
import { indenter } from "./indenter.mjs"

var symbols = {};

function writeTokens(lexer) {
    var result = document.getElementById("result");
    result.value = "";
    try {
        for(let token = lexer(); !token.eof; token = lexer()) {
            if (token.sof) continue;
            result.value += stringifyLine(token);
            result.value += " ";
        }
    }
    catch (e) {
        result.value = e;
    }
}

function stringifyLine(line) {
    if (Array.isArray(line)) return JSON.stringify(line) + "\n";
    else return stringifyToken(line);
}

function stringifyToken(token) {
    if (token.symbol) {
        return "{sym: " + token.text + "}";
    }
    else if (token === "\n") {
        return "{newline}";
    }
    else if (token.whitespace) {
        return "{space: " + token.length + "}";
    }
    return token;
}

document.getElementById("parse").addEventListener("click", () => writeTokens(indenter(lexer())));
