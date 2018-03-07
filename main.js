/*
1. clean up row/column confusion
2. fix bug with diff col/row counts
3. be able to switch levels
4. maybe make clicks per column
5. hover highlights
6. figure out color scheme that makes sense
*/

var ON = 1;
var OFF = 0;
var DISABLED = -1;

var stage;

var STAGE_WIDTH = 800;
var STAGE_HEIGHT = 800;

var BUTTON_SIZE = 25;
var GAP_BETWEEN_BUTTONS = BUTTON_SIZE/2;

var ON_STRIPE_COLOR = "#ffe37a";
var OFF_STRIPE_COLOR = "#ffffff";
var ON_BUTTON_COLOR = "#ffcc5c";
var OFF_BUTTON_COLOR = "#ff6f69";

function setMetrics(state) {
    //center board on x axis
    var buttonsWidth = state.column_count * BUTTON_SIZE + (state.column_count - 1) * GAP_BETWEEN_BUTTONS;
    var widthLeftOver = STAGE_WIDTH - buttonsWidth;
    state.boardStartX = widthLeftOver / 2;

    //center board on y axis
    var buttonsHeight = state.row_count * BUTTON_SIZE + (state.row_count - 1) * GAP_BETWEEN_BUTTONS;
    var heightLeftOver = STAGE_HEIGHT - buttonsHeight;
    state.boardStartY = heightLeftOver / 2;
}

function stateToColor(buttonState) {
    var color;
    if (buttonState == ON) {
        color = ON_BUTTON_COLOR;
    } else if (buttonState == OFF) {
        color = OFF_BUTTON_COLOR;
    } else {
        color = "black";
    }
    return color;
}

function flipColumn(state, clickedColumn) {
    for (var row = 0; row < state.row_count; row++) {
        var buttonState = state.board[clickedColumn][row];
        if (buttonState == ON) {
            buttonState = OFF;
        } else if (buttonState == OFF) {
            buttonState = ON;
        }
        state.board[clickedColumn][row] = buttonState;
    }
}

function won(stripeStates) {
    var won = true;
    for (let i = 0; i < stripeStates.length; i++) {
        if (!stripeStates[i]) {
            won = false;
        }
    }
    return won;
}

function evaluateStripes(state) {
    var stripeStates = [];
    for (var j = 0; j < state.row_count; j++) {
        var hasOnButton = false;
        for (var i = 0; i < state.column_count; i++) {
            if (state.board[i][j] == ON) {
                hasOnButton = true;
                break;
            }
        }
        console.log(hasOnButton);
        stripeStates.push(hasOnButton);
    }
    return stripeStates;
}

function createButton(state, i, j) {
    var buttonState = state.board[i][j];
    if (buttonState == DISABLED) {
        return;
    }    

    var x = state.boardStartX + BUTTON_SIZE * i + GAP_BETWEEN_BUTTONS * (i);
    var y = state.boardStartY + BUTTON_SIZE * j * 1.5;
    
    var button = new createjs.Shape();
    button.graphics.beginFill(stateToColor(buttonState));
    button.graphics.setStrokeStyle(1,"round").beginStroke("#000").rect(x, y, BUTTON_SIZE, BUTTON_SIZE);
    
    button.addEventListener("click", function(event) {
        flipColumn(state, i);
        if (won(evaluateStripes(state))) {

        }
        draw(state)
        state.stage.update();
    });

    state.stage.addChild(button);
}

function drawStripe(state, row, stripeState) {
    var stripe = new createjs.Shape();
    stripe.graphics.beginFill(stripeState ? ON_STRIPE_COLOR : OFF_STRIPE_COLOR);
    stripe.graphics.rect(0, state.boardStartY + BUTTON_SIZE * row * 1.5 - (BUTTON_SIZE/4), 
        STAGE_WIDTH , BUTTON_SIZE + (BUTTON_SIZE/2));
    state.stage.addChild(stripe);
}

//doesnt work
function drawBackground(stage) {
    var bg = new createjs.Shape();
    bg.graphics.beginFill("000000");
    bg.graphics.rect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
    //stage.addChild(bg);
}

function draw(state) {
    var stripeStates = evaluateStripes(state);
    for(var i = 0; i < stripeStates.length; i++) {
        drawStripe(state, i, stripeStates[i]);
    }

    for (var i = 0; i < state.column_count; i++) {
        for(var j = 0; j < state.row_count; j++) {
            createButton(state, i, j);
        }
    }
    state.stage.update();
}

function fillBoardRandomly(state, q) {
    for (var i = 0; i < state.column_count; i++) {
        for (var j = 0; j < state.row_count; j++) {
            var num = (Math.random() * 100) | 0;
            console.log(num - 1);
            var val;
            if (num < 15) {
                val = ON;
            } else if (num < 30) {
                val = OFF;
            } else {
                val = DISABLED;
            }
            q[i][j] = val;
        }
    }
}

function flipOnsToOffsRandomly(state, q) {
    for (var i = 0; i < state.column_count; i++) {
        for (var j = 0; j < state.row_count; j++) {
            var num = (Math.random() * 100) | 0;
            if (q[i][j] == ON && num < 50) {
                q[i][j] = OFF;
            }
        }
    }
}

function fillGapsInBoardRandomly(state, q) {
    for (var i = 0; i < state.column_count; i++) {
        for (var j = 0; j < state.row_count; j++) {
            var num = (Math.random() * 100) | 0;
            if (q[i][j] == DISABLED && num < 15) {
                q[i][j] = OFF;
            }
        }
    }
}

function getBoard(state) {
    var q = createEmptyBoard(state);
    fillBoardRandomly(state, q);
    return q;
}

function createEmptyBoard(state) {
    var q = [];
    for (var i = 0; i < state.column_count; i++) {
        var z = [];
        for (var j = 0; j < state.row_count; j++) {
            z.push(DISABLED);
        }
        q.push(z);
    }
    return q;
}

function rowButtonCount(state, q, row) {
    var count = 0;
    for (var column = 0; column < state.column_count; column++) {
        if (q[column][row] == ON || q[column][row] == OFF) {
            count++;
        }
    }
    return count;
}

function findFirstButtonInRow(state, q, row) {
    for (var column = 0; column < state.column_count; column++) {
        if (q[column][row] == ON || q[column][row] == OFF) {
            return column;
        }
    }
    return -1;
}

function ensureEachRowHasMoreThanOneButton(state, q) {
    for (var row = 0; row < state.row_count; row++) {
        if (rowButtonCount(state, q, row) == 1) {
            var unusedCols = [];
            for (let i = 0; i < state.column_count; i++) {
                unusedCols.push(i);
            }
            unusedCols.splice(findFirstButtonInRow(state, q, row), 1);
            let randomIndex = (Math.random() * unusedCols.length) | 0;
            let randomCol = unusedCols[randomIndex];

            var num = (Math.random() * 100) | 0;
            if (num < 50) {
                q[randomCol][row] = ON;
            } else {
                q[randomCol][row] = OFF;
            }
        }
    }
}

//guarantees puzzle is solvable
function addRandomOnToEachRow(state, q) {
    var unusedCols = [];
    for (let i = 0; i < state.column_count; i++) {
        unusedCols.push(i);
    }
    for (var row = 0; row < state.row_count; row++) {
        if (unusedCols.length > 0) {
            let randomIndex = (Math.random() * unusedCols.length) | 0;
            let randomCol = unusedCols[randomIndex];
            unusedCols.splice(randomIndex, 1);
            q[randomCol][row] = ON;    
        } else {
            let randomCol = (Math.random() * state.column_count) | 0;
            q[randomCol][row] = ON;    
        }
    }
}

function flipColumnsRandomly(state, q) {
    for (var i = 0; i < 100; i++) {
        let randomCol = (Math.random() * state.column_count) | 0;
        console.log(randomCol);
        flipColumn(state, randomCol);
    }
}

function generateBoard(state) {
    var q = createEmptyBoard(state);
    state.board = q;
    addRandomOnToEachRow(state, q);
    //flipOnsToOffsRandomly(state, q);
    fillGapsInBoardRandomly(state, q);
    flipColumnsRandomly(state, q);
    ensureEachRowHasMoreThanOneButton(state, q);
    return q;
}

function newState() {
    var state = {
        board: null,
        stage: null,
        column_count: 10,
        row_count: 20,
        boardStartX: 0,
        boardStartY: 0,
    }
    return state;
}

function init() {
    var state = newState();
    //state.board = getBoard(state);
    state.board = generateBoard(state);
    setMetrics(state);    
    state.stage = new createjs.Stage("demoCanvas");
    draw(state);
  }

function handleTick(event) {
    stage.update();
}