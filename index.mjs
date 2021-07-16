var symbols = {};
var tokens = [];
var eof = { eof: true }
let sof = { sof: true }

function stringToken(str) {
    return (text, i) => {
        if (i + str.length > text.length) {
            return undefined;
        }
        else if (text.substring(i, i + str.length) === str) {
            return {index: i + str.length, token: str};
        }
        else {
            return undefined;
        }
    };
}

function token(m) {
    tokens.push(typeof(m) == "string" ? stringToken(m) : m);
}

function isDigit(c) {
    return /\d/.test(c);
}

function isSymbolChar(c) {
    return typeof(c) === "string" && "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_0123456789".search(c) !== -1;
}

function isInitialSymbolChar(c) {
    return isSymbolChar(c) && !isDigit(c);
}

function then(...matchers) {
    return (text, index) => {
        let acc = undefined;
        for(let i=0; i< matchers.length; ++i) {
            let m = matchers[i];
            let result = m(text, index);
            if (!result) {
                return undefined;
            }
            index = result.index;
            if (acc === undefined) {
                acc = result.token;
            }
            else {
                acc = acc + result.token;
            }
        };
        return {index: index, token: acc};
    };
}

function many(matcher) {
    return (text, index) => {
        let token = "";
        while(true) {
            let match = matcher(text, index);
            if (!match) {
                break;
            }
            index = match.index;
            token += match.token;
        }
        return {token, index};
    };
}

function some(matcher) {
    return then(matcher, many(matcher));
}

function optional(matcher) {
    return (text, index) => {
        let match = matcher(text, index);
        if (match) {
            return match;
        }
        return {index, token: ""};
    }
}

function charClass(p) {
    return (text, index) => {
        if (p(text[index])) {
            return {index: index + 1, token: text[index]};
        }
    };
}

function action(matcher, action) {
    return (text, index) => {
        let match = matcher(text, index);
        if (match) {
            return {index: match.index, token: action(match.token)};
        }
    }
}

token(action(then(optional(stringToken("-")), some(charClass(isDigit))), parseInt));
token("=");
token("-");
token("*");
token("/");
token("+");
token("(");
token(")");
token("\n");
token(action(
    then(charClass(isInitialSymbolChar), 
         many(charClass(isSymbolChar))), 
    t => {return {symbol: true, text: t}}));

function lexer() {
    let text = document.getElementById("codeToParse").value;
    let index = 0;
    let firstPass = true;

    function tryTokens() {
        if (firstPass) {
            firstPass = false;
            return {index, token: sof}
        }
        if (index >= text.length) {
            return {index, token: eof};
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
    return token;
}

document.getElementById("parse").addEventListener("click", () => writeTokens(lexer()));
