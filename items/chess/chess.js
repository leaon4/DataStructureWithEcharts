"use strict";
const board = new Array(9).fill(0);
var ChessValue;
(function (ChessValue) {
    ChessValue[ChessValue["COMPLOSS"] = 0] = "COMPLOSS";
    ChessValue[ChessValue["DRAW"] = 1] = "DRAW";
    ChessValue[ChessValue["COMPWIN"] = 2] = "COMPWIN";
})(ChessValue || (ChessValue = {}));
;
var ChessType;
(function (ChessType) {
    ChessType[ChessType["HUMAN"] = 1] = "HUMAN";
    ChessType[ChessType["COMP"] = 2] = "COMP";
})(ChessType || (ChessType = {}));
;
function drawChess(el, type) {
    if (type === 'o') {
        el.classList.add('circle');
    }
    else {
        el.classList.add('cross');
    }
}
function chessDown(e) {
    let el = e.target;
    if (el.tagName !== 'TD') {
        return;
    }
    let index = Number(el.dataset.index);
    if (board[index]) {
        return;
    }
    board[index] = 1;
    drawChess(el, 'o');
    runChess();
}
function runChess() {
    let pair = {
        bestMove: -1,
        value: ChessValue.COMPLOSS
    };
    findCompMove(pair, ChessValue.COMPWIN + 1);
    board[pair.bestMove] = 2;
    if (isBoardFull() && pair.value === ChessValue.DRAW) {
        setTimeout(() => {
            alert('DRAW');
        });
        if (pair.bestMove === -1) {
            return;
        }
    }
    console.log(pair);
    let el = document.getElementsByTagName('td')[pair.bestMove];
    drawChess(el, 'x');
    if (pair.value === ChessValue.COMPLOSS || pair.value === ChessValue.COMPWIN) {
        if (isWin(pair.value === ChessValue.COMPWIN ? 2 : 1)) {
            setTimeout(() => {
                alert(ChessValue[pair.value]);
            });
        }
    }
    console.log(count);
    count = 0;
}
function computerFirst() {
    let ran = Math.random() > 0.5 ? ~~(Math.random() * 9) : 4;
    board[ran] = 2;
    let el = document.getElementsByTagName('td')[ran];
    drawChess(el, 'x');
}
function assumeChessDown(i, chessType) {
    board[i] = chessType;
}
function restoreBoard(i) {
    board[i] = 0;
}
function isWin(chessType) {
    return isSame(0, 1, 2)
        || isSame(3, 4, 5)
        || isSame(6, 7, 8)
        || isSame(0, 3, 6)
        || isSame(1, 4, 7)
        || isSame(2, 5, 8)
        || isSame(0, 4, 8)
        || isSame(2, 4, 6);
    function isSame(idx1, idx2, idx3) {
        return chessType === board[idx1]
            && chessType === board[idx2]
            && chessType === board[idx3];
    }
}
function immediateWin(pair, chessType) {
    for (let i = 0; i < board.length; i++) {
        if (board[i])
            continue;
        assumeChessDown(i, chessType);
        if (isWin(chessType)) {
            pair.bestMove = i;
            pair.value = chessType === ChessType.COMP ? ChessValue.COMPWIN : ChessValue.COMPLOSS;
            restoreBoard(i);
            return true;
        }
        restoreBoard(i);
    }
    return false;
}
function isBoardFull() {
    return board.every(item => !!item);
}
let count = 0;
function findCompMove(pair, beta) {
    count++;
    if (isBoardFull()) {
        pair.value = ChessValue.DRAW;
        return;
    }
    if (immediateWin(pair, ChessType.COMP)) {
        return;
    }
    pair.value = ChessValue.COMPLOSS - 1;
    let resPair = {
        bestMove: -1,
        value: ChessValue.DRAW
    };
    for (let i = 0; i < board.length && pair.value < beta; i++) {
        if (board[i])
            continue;
        assumeChessDown(i, ChessType.COMP);
        findHumanMove(resPair, pair.value);
        restoreBoard(i);
        if (resPair.value > pair.value) {
            pair.value = resPair.value;
            pair.bestMove = i;
            // 虽然这步可以break。但其实并不一定是优中之优（对于其他棋来说可能有步数更短的取胜方法）
            if (resPair.value === ChessValue.COMPWIN) {
                break;
            }
        }
    }
}
function findHumanMove(pair, alpha) {
    count++;
    if (isBoardFull()) {
        pair.value = ChessValue.DRAW;
        return;
    }
    if (immediateWin(pair, ChessType.HUMAN)) {
        return;
    }
    pair.value = ChessValue.COMPWIN + 1;
    let resPair = {
        bestMove: -1,
        value: ChessValue.DRAW
    };
    for (let i = 0; i < board.length && pair.value > alpha; i++) {
        if (board[i])
            continue;
        assumeChessDown(i, ChessType.HUMAN);
        findCompMove(resPair, pair.value);
        restoreBoard(i);
        if (resPair.value < pair.value) {
            pair.value = resPair.value;
            pair.bestMove = i;
            if (resPair.value === ChessValue.COMPLOSS) {
                break;
            }
        }
    }
}
//# sourceMappingURL=chess.js.map