import { lexer } from "./lexer.mjs";

function writeTokens(lexer) {
    var result = document.getElementById("result");
    result.value = "";
    try {
        for(let token = lexer(); !token.eof; token = lexer()) {
            if (token.sof) continue;
            result.value += stringifyToken(token);
            result.value += " ";
        }
    }
    catch (e) {
        result.value = "Error at " + e[0] + ": " + e[1];
    }
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

document.getElementById("parse").addEventListener("click", () => writeTokens(lexer()));
