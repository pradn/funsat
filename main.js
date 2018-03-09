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

var STAGE_WIDTH = 1000;
var STAGE_HEIGHT = 1000;

var BUTTON_SIZE = 10;
var GAP_BETWEEN_BUTTONS = BUTTON_SIZE/2;

var ON_STRIPE_COLOR = "#ffe37a";
var OFF_STRIPE_COLOR = "#ffffff";
var ON_BUTTON_COLOR = "#ffcc5c";
var OFF_BUTTON_COLOR = "#ff6f69";

function getRow(state, rowNum) {
    return _.map(_.range(state.column_count), function (columnNum) {
        return state.board[columnNum][rowNum];
    })
}

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
        var hasOnButton = _.any(getRow(state, j), function (boardState) { return boardState == ON; });
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
            console.log("win!!");
        }
        draw(state);
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

//unused
function createViewModel(state) {
    var buttons = createEmptyBoard(state, null);
    forWholeBoard(state, function (nullVal, i, j) {
        var buttonState = state.board[i][j];
        if (buttonState == DISABLED) {
            return null;
        }    

        var x = state.boardStartX + BUTTON_SIZE * i + GAP_BETWEEN_BUTTONS * i;
        var y = state.boardStartY + BUTTON_SIZE * j * 1.5;
        
        var button = new createjs.Shape();
        button.graphics.beginFill(stateToColor(buttonState));
        button.graphics.setStrokeStyle(1,"round").beginStroke("#000").rect(x, y, BUTTON_SIZE, BUTTON_SIZE);
        
        button.addEventListener("click", function(event) {
            //maybe use target
            flipColumn(state, i);
            if (won(evaluateStripes(state))) {
                console.log("win!!");
            }
            draw(state);
            state.stage.update();
        });

        state.stage.addChild(button);
        return button;
    });
    state.buttons = buttons;

    var stripes = [];
    for(var i = 0; i < state.row_count; i++) {
        var stripe = new createjs.Shape();
        stripe.graphics.beginFill(stripeState ? ON_STRIPE_COLOR : OFF_STRIPE_COLOR);
        stripe.graphics.rect(0, state.boardStartY + BUTTON_SIZE * row * 1.5 - (BUTTON_SIZE/4), 
            STAGE_WIDTH , BUTTON_SIZE + (BUTTON_SIZE/2));
        state.stage.addChild(stripe);
        stripes.push(stripe);
    }
    state.stripes = stripes;
}

function forWholeBoard(state, fn) {
    for (var i = 0; i < state.column_count; i++) {
        for (var j = 0; j < state.row_count; j++) {
            state.board[i][j] = fn(state.board[i][j], i, j);
        }
    }
}

function fillBoardRandomly(state, q) {
    forWholeBoard(state, function (buttonState) {
        var num = (Math.random() * 100) | 0;
        var val;
        if (num < 15) {
            val = ON;
        } else if (num < 30) {
            val = OFF;
        } else {
            val = DISABLED;
        }
        return val;
    });
}

function flipOnsToOffsRandomly(state, q) {
    forWholeBoard(state, function (buttonState) {
        var num = (Math.random() * 100) | 0;
        if (buttonState == ON && num < 50) {
            return OFF;
        }
        return buttonState;
    });
}

function fillGapsInBoardRandomly(state, q) {
    forWholeBoard(state, function (buttonState) {
        var num = (Math.random() * 100) | 0;
        if (buttonState == DISABLED && num < 15) {
            return OFF;
        }
        return buttonState;
    });
}

function getBoard(state) {
    var q = createEmptyBoard(state, DISABLED);
    fillBoardRandomly(state, q);
    return q;
}

function createEmptyBoard(state, defaultValue) {
    var q = [];
    for (var i = 0; i < state.column_count; i++) {
        var z = [];
        for (var j = 0; j < state.row_count; j++) {
            z.push(defaultValue);
        }
        q.push(z);
    }
    return q;
}

function isValidButton(buttonState) {
    return buttonState == ON || buttonState == OFF;
}

function rowButtonCount(state, row) {
    return _.reduce(_.each(getRow(row)), function (prev, cur) { return prev + cur; });
}

function findFirstButtonInRow(state, row) {
    return  _.findIndex(getRow(state, row), isValidButton);
}

function ensureEachRowHasMoreThanOneButton(state, q) {
    for (var row = 0; row < state.row_count; row++) {
        if (rowButtonCount(state, q, row) == 1) {
            var unusedCols = _.range(state.column_count);
            unusedCols.splice(findFirstButtonInRow(state, row), 1);
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

function getColumn(state, columnNum) {
    return _.map(_.range(state.row_count), function (rowNum) {
        return state.board[columnNum][rowNum];
    });
}

function sum(arr) {
    return _.reduce(arr, function (sum, next) { return sum + next; });
}

function getWeightedProbabilities(weights) {
    let weightsSum = sum(weights);
    let probabilities = _.map(weights, function (weight) { return weight / weightsSum; });
    return probabilities;
}

function pickIndexFromProbabilitiesArray(probabilities) {
    let random = Math.random();
    var s = 0;
    for (let i = 0; i < probabilities.length; i++) {
        s += probabilities[i];
        if (random < s) {
            return i;
        }
    }
    return probabilities.length - 1;
}

function pickColumnWeighingColumnButtonCount(state, rowNum) {
    var columnButtonCounts = _.map(_.range(0, state.column_count), function (columnNum) {
        return countIf(getColumn(state, columnNum), isValidButton);
    });
    var maxColumnButtonCount = _.max(columnButtonCounts);
    // higher count = lower weight
    var weights = _.map(columnButtonCounts, function (c) { 
        if (c == 0) {
            //overweight if col has 0 buttons
            return maxColumnButtonCount * 2;
        }
        return maxColumnButtonCount - c;
    });
    var probs = getWeightedProbabilities(weights);
    // make sure existing buttons arent picked from row
    var probsWithoutTakenCols = _.map(probs, function (val, col) {
        if (isValidButton(state.board[col][rowNum])) {
            return 0;
        }
        return val;
    });
    var pickedCol = pickIndexFromProbabilitiesArray(probs);
    return pickedCol;
}

function addMoreButtonsToEachRowWeightedByColumnButtonCount(state, addCount) {
    //assumes each row has exactly one column with a button
    for (var row = 0; row < state.row_count; row++) {
        // if (rowButtonCount(state, row) != 1) {
        //     alert("row doesnt have enough buttons: " + row);
        // }

        for (var i = 0; i < addCount; i++) {
            var colNum = pickColumnWeighingColumnButtonCount(state, row);
            var num = (Math.random() * 100) | 0;
            if (num < 50) {
                state.board[colNum][row] = ON;
            } else {
                state.board[colNum][row] = OFF;
            }
        }
    }
}


function addMoreButtonsToEachRow(state, addCount) {
    //assumes each row has exactly one column with a button
    for (var row = 0; row < state.row_count; row++) {
        if (rowButtonCount(state, row) != 1) {
            alert("bbb");
        }
        var unusedCols = _.range(state.column_count);
        unusedCols.splice(findFirstButtonInRow(state, row), 1);

        for (var i = 0; i < addCount && unusedCols.length > 0; i++) {
            let randomIndex = (Math.random() * unusedCols.length) | 0;
            let randomCol = unusedCols[randomIndex];
    
            var num = (Math.random() * 100) | 0;
            if (num < 50) {
                state.board[randomCol][row] = ON;
            } else {
                state.board[randomCol][row] = OFF;
            }
        }
    }
}

//guarantees puzzle is solvable
function addRandomOnToEachRow(state, q) {
    var unusedCols = _.range(state.column_count);
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
    _.times(100, function (n) {
        let randomCol = (Math.random() * state.column_count) | 0;
        flipColumn(state, randomCol);
    });
}

// lots of random buttons here and there
function generateBoard(state) {
    var q = createEmptyBoard(state, DISABLED);
    state.board = q;
    addRandomOnToEachRow(state, q);
    flipOnsToOffsRandomly(state, q);
    fillGapsInBoardRandomly(state, q);
    ensureEachRowHasMoreThanOneButton(state, q);    
    flipColumnsRandomly(state, q);
    return q;
}

// a few buttons per row
function generateBoardNew(state) {
    var q = createEmptyBoard(state, DISABLED);
    state.board = q;
    addRandomOnToEachRow(state, q);
    flipOnsToOffsRandomly(state, q);
    addMoreButtonsToEachRow(state, 1);
    flipColumnsRandomly(state, q);
    return q;
}

// a few buttons per row
function generateBoardWeighted(state) {
    var q = createEmptyBoard(state, DISABLED);
    state.board = q;
    addRandomOnToEachRow(state, q);
    flipOnsToOffsRandomly(state, q);
    addMoreButtonsToEachRowWeightedByColumnButtonCount(state, 2);
    flipColumnsRandomly(state, q);
    return q;
}

function newState(cols, rows) {
    var state = {
        board: null,
        stage: null,
        column_count: cols,
        row_count: rows,
        boardStartX: 0,
        boardStartY: 0,
        stage: null,
        buttons: null,
        stripes: null
    }
    state.stage = new createjs.Stage("demoCanvas");
    createjs.Touch.enable(stage);
    return state;
}

function countIf(arr, pred) {
    return _.filter(arr, pred).length;
}

function identity(a) {
    return a;
}

function countActivatedStripes(stripeStates) {
    return countIf(stripeStates, identity);
}

// maybe place column buddies

function getGoodState() {
    var lowestActivated = 1000;
    var bestState;

    for (var i = 0; i < 10; i++) {
        var state = newState(20, 50);
        state.board = generateBoardWeighted(state);
        var stripeStates = evaluateStripes(state);
        var activated = countActivatedStripes(stripeStates);
        console.log(activated);
        if (activated < lowestActivated) {
            lowestActivated = activated;
            bestState = state;
        }
    }

    return bestState;
}

function introScreen(state) {
    var bg = new createjs.Shape();
    bg.graphics.beginFill("#ffe37a");
    bg.graphics.rect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
    state.stage.addChild(bg);

    var fontPx = STAGE_WIDTH/4;
    var text = new createjs.Text("SAT!", "bold " + fontPx + "px Serif", "#FF");
    text.x = STAGE_WIDTH/2 - text.getMeasuredWidth()/2;
    text.y = STAGE_HEIGHT/4;
    state.stage.addChild(text);

    state.stage.update();
}

function init() {
    // no minimization method
    //var state = newState(15, 20);
    //state.board = generateBoard(state);

    var state = getGoodState();
    console.log(state.board);
    
    setMetrics(state);    
    draw(state);
    
    //introScreen(state);
}

//board gen
// easiest to start with valid board game and then add transformations
// ensure at least one on each row. if only one, player knows to set that one to ON.
// too many in one column makes it too easy to activate lots of rows at once
// distribute buttons along a row in inverse proprotion to # of buttons in that column already?
// gaps are a problem. make it too easy. maybe an algo to go through and ensure each win point has a col and row alternative?


// happy enough with the end results
// never to do:
// remove unused code
// add intro screen, generate new level button, you win screen, be able to change level dimensions
// but i'm not going to do all this because the interesting part was level gen

// lesson learned:
// put all state in one object. makes it easy to regen level, restart game
// separate game logic (model), game loop (controller), view model (game UI objects), and renderer
// use underscore or equivalent