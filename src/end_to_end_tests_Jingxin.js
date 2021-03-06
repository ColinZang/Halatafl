/**
 * File: src/end_to_end_tests_Jingxin.js
 * ----------------------------------------
 * @author: Jingxin Zhu
 * @date  : 2015.03.17
 * ----------------------------------------
 */


describe('Halatafl', function() {

    'use strict';

    beforeEach(function() {
        browser.get('http://localhost:9000/game.html');
    });

    function getDiv(row, col) {
        return element(by.id('e2e_test_div_' + row + 'x' + col));
    }

    function getImg(row, col) {
        return element(by.id('e2e_test_img_' + row + 'x' + col));
    }

    function expectPiece(row, col, pieceKind) {
        var img_prefix = "http://localhost:9000/imgs/";

        if (pieceKind == 'F')
            expect(getImg(row, col).getAttribute("src")).toEqual(img_prefix + "fox.png");
        else if (pieceKind == 'F_trans')
            expect(getImg(row, col).getAttribute("src")).toEqual(img_prefix + "fox_selected.png");
        else if (pieceKind == 'S')
            expect(getImg(row, col).getAttribute("src")).toEqual(img_prefix + "sheep.png");
        else if (pieceKind == 'S_trans')
            expect(getImg(row, col).getAttribute("src")).toEqual(img_prefix + "sheep_selected.png");
        else if (pieceKind == '' || pieceKind == 'X')
            expect(getImg(row, col).getAttribute("src")).toEqual(img_prefix + "empty.png");
    }

    function expectBoard(board) {
        for (var row = 0; row < 7; row++) {
            for (var col = 0; col < 7; col++){
                expectPiece(row, col, board[row][col]);
            }
        }
    }

    function clickDivAndExpectPiece(row, col, pieceKind) {
        getDiv(row, col).click();
        expectPiece(row, col, pieceKind);
    }

    // playMode is either: 'passAndPlay', 'playAgainstTheComputer', 'onlyAIs',
    // or a number representing the playerIndex (-2 for viewer, 0 for white player, 1 for black player, etc)
    function setMatchState(matchState, playMode) {
        browser.executeScript(function(matchStateInJson, playMode) {
            var stateService = window.e2e_test_stateService;
            stateService.setMatchState(angular.fromJson(matchStateInJson));
            stateService.setPlayMode(angular.fromJson(playMode));
            angular.element(document).scope().$apply(); // to tell angular that things changes.
        }, JSON.stringify(matchState), JSON.stringify(playMode));
    }

    it('should have a title', function () {
        expect(browser.getTitle()).toEqual('Halatafl');
    });

    it('should have an initial board', function () {
        expectBoard(
            [['X','X','F', '', 'F','X','X'],
                ['X','X','', '', '','X','X'],
                ['','','','','','',''],
                ['S','S','S','S','S','S','S'],
                ['S','S','S','S','S','S','S'],
                ['X','X','S','S','S','X','X'],
                ['X','X','S','S','S','X','X']]);
    });

    it('should move the fox after clicking twice', function () {
        clickDivAndExpectPiece(3, 3, "S_trans");
        clickDivAndExpectPiece(2, 3, "");
        expectBoard(
            [   ['X','X','F', '', 'F','X','X'],
                ['X','X','' , '', '','X','X'],
                ['','','','S','','',''],
                ['S','S','S','','S','S','S'],
                ['S','S','S','S','S','S','S'],
                ['X','X','S','S','S','X','X'],
                ['X','X','S','S','S','X','X']]);
    });

    it('should ignore move on the sheep not in the first row at the game beginning', function () {
        clickDivAndExpectPiece(4, 0, "S_trans");
        clickDivAndExpectPiece(2, 0, "");
        clickDivAndExpectPiece(3, 0, 'S_trans');
        clickDivAndExpectPiece(3, 1, 'S_trans');
        expectBoard(
            [['X','X','F', '', 'F','X','X'],
                ['X','X','', '', '','X','X'],
                ['','','','','','',''],
                ['S','S_trans','S','S','S','S','S'],
                ['S','S','S','S','S','S','S'],
                ['X','X','S','S','S','X','X'],
                ['X','X','S','S','S','X','X']]);
    });

    it('sheep cannot go backward', function () {
        clickDivAndExpectPiece(3, 3, "S_trans");
        clickDivAndExpectPiece(4, 3, "S_trans");   //valid move
        expectBoard(
            [['X','X','F', '', 'F','X','X'],
                ['X','X','', '', '','X','X'],
                ['','','','','','',''],
                ['S','S','S','S','S','S','S'],
                ['S','S','S','S_trans','S','S','S'],
                ['X','X','S','S','S','X','X'],
                ['X','X','S','S','S','X','X']]);
    });

    it('fox can jump', function () {
        clickDivAndExpectPiece(3, 2, "S_trans");
        clickDivAndExpectPiece(2, 2, "S");
        clickDivAndExpectPiece(0, 2, "F_trans");
        clickDivAndExpectPiece(1, 3, "F");
        clickDivAndExpectPiece(3, 3, "S_trans");
        clickDivAndExpectPiece(2, 3, "S");

        // fox jump
        clickDivAndExpectPiece(1, 3, "F_trans");
        clickDivAndExpectPiece(3, 3, "F");

        clickDivAndExpectPiece(2, 3, "");
        expectBoard(
            [['X','X','', '', 'F','X','X'],
                ['X','X','', '', '','X','X'],
                ['','','S','','','',''],
                ['S','S','','F','S','S','S'],
                ['S','S','S','S','S','S','S'],
                ['X','X','S','S','S','X','X'],
                ['X','X','S','S','S','X','X']]);
    });

    iit('fox must jump when is able to eat', function () {
        clickDivAndExpectPiece(3, 2, "S_trans");
        clickDivAndExpectPiece(2, 2, "S");
        clickDivAndExpectPiece(0, 2, "F_trans");
        clickDivAndExpectPiece(1, 2, "F");
        clickDivAndExpectPiece(3, 3, "S_trans");
        clickDivAndExpectPiece(2, 3, "S");

        // try to move another fox
        clickDivAndExpectPiece(0, 4, "F_trans");
        clickDivAndExpectPiece(1, 3, "");

        // board will not show the above move
        expectBoard(
            [   ['X','X','', '', 'F_trans','X','X'],
                ['X','X','F', '', '','X','X'],
                ['','','S','S','','',''],
                ['S','S','','','S','S','S'],
                ['S','S','S','S','S','S','S'],
                ['X','X','S','S','S','X','X'],
                ['X','X','S','S','S','X','X']]);
    });


    var delta1 = {rowBefore: 1, colBefore: 4, rowAfter: 1, colAfter: 3};
    var board1 =
        [['X', 'X', '', '', 'S', 'X', 'X'],
            ['X', 'X', 'S', 'F', '', 'X', 'X'],
            ['', '', '', 'F', '', '', ''],
            ['S', '', '', 'S', '', '', 'S'],
            ['S', '', '', '', '', 'S', 'S'],
            ['X', 'X', '', '', '', 'X', 'X'],
            ['X', 'X', '', '', 'S', 'X', 'X']];


    var delta2 = {rowBefore: 1, colBefore: 2, rowAfter: 0, colAfter: 2};
    var board2 =
        [['X', 'X', 'S', '', 'S', 'X', 'X'],
            ['X', 'X', '', 'F', '', 'X', 'X'],
            ['', '', '', 'F', '', '', ''],
            ['S', '', '', 'S', '', '', 'S'],
            ['S', '', '', '', '', 'S', 'S'],
            ['X', 'X', '', '', '', 'X', 'X'],
            ['X', 'X', '', '', 'S', 'X', 'X']];
    var delta3 = {rowBefore: 2, colBefore: 3, rowAfter: 4, colAfter: 3};
    var board3 =
        [['X', 'X', 'S', '', 'S', 'X', 'X'],
            ['X', 'X', '', 'F', '', 'X', 'X'],
            ['', '', '', '', '', '', ''],
            ['S', '', '', '', '', '', 'S'],
            ['S', '', '', 'F', '', 'S', 'S'],
            ['X', 'X', '', '', '', 'X', 'X'],
            ['X', 'X', '', '', 'S', 'X', 'X']];

    var matchState2 = {
        turnIndexBeforeMove: 0,
        turnIndex: 1,
        endMatchScores:null,
        lastMove: [{setTurn: {turnIndex: 1}},
            {set: {key: 'board', value: board2}},
            {set: {key: 'delta', value: delta2}}],
        lastState: {board: board1, delta: delta1},
        currentState: {board: board2, delta: delta2},
        lastVisibleTo: {},
        currentVisibleTo: {}
    };

    it('can start from a match that is about to end, and win, for fox', function () {
        setMatchState(matchState2, 'passAndPlay');
        expectBoard(board2);
        clickDivAndExpectPiece(2, 3, "F_trans"); // winning click!
        clickDivAndExpectPiece(4, 3, "F");
        clickDivAndExpectPiece(4, 3, "F"); // can't click after game ended
        expectBoard(board3);
    });

    it('cannot play if it is not your turn', function () {
        // Now make sure that if you're playing "O" (your player index is 1) then
        // you can't do the winning click!
        setMatchState(matchState2, 0); // playMode=1 means that yourPlayerIndex=1.
        expectBoard(board2);
        clickDivAndExpectPiece(2, 3, "F");
        clickDivAndExpectPiece(4, 3, ""); // can't do the winning click!
        expectBoard(board2);
    });



    var delta11 = {rowBefore: 4, colBefore: 4, rowAfter: 3, colAfter: 4};
    var board11 =
        [['X', 'X', 'S', 'S', 'S', 'X', 'X'],
            ['X', 'X', 'S', 'S', 'S', 'X', 'X'],
            ['', '', 'S', 'S', '', '', ''],
            ['', '', '', '', 'S', '', ''],
            ['F', 'F', '', '', '', '', ''],
            ['X', 'X', '', '', '', 'X', 'X'],
            ['X', 'X', '', '', '', 'X', 'X']];


    var delta21 = {rowBefore: 4, colBefore: 1, rowAfter: 3, colAfter: 1};
    var board21 =
        [['X', 'X', 'S', 'S', 'S', 'X', 'X'],
            ['X', 'X', 'S', 'S', 'S', 'X', 'X'],
            ['', '', 'S', 'S', '', '', ''],
            ['', 'F', '', '', 'S', '', ''],
            ['F', '', '', '', '', '', ''],
            ['X', 'X', '', '', '', 'X', 'X'],
            ['X', 'X', '', '', '', 'X', 'X']];
    var delta31 = {rowBefore: 3, colBefore: 4, rowAfter: 2, colAfter: 4};
    var board31 =
        [['X', 'X', 'S', 'S', 'S', 'X', 'X'],
            ['X', 'X', 'S', 'S', 'S', 'X', 'X'],
            ['', '', 'S', 'S', 'S', '', ''],
            ['', 'F', '', '', '', '', ''],
            ['F', '', '', '', '', '', ''],
            ['X', 'X', '', '', '', 'X', 'X'],
            ['X', 'X', '', '', '', 'X', 'X']];


    var matchState21 = {
        turnIndexBeforeMove: 1,
        turnIndex: 0,
        endMatchScores:null,
        lastMove: [{setTurn: {turnIndex: 0}},
            {set: {key: 'board', value: board21}},
            {set: {key: 'delta', value: delta21}}],
        lastState: {board: board11, delta: delta11},
        currentState: {board: board21, delta: delta21},
        lastVisibleTo: {},
        currentVisibleTo: {}
    };



    var matchState3 = {
        turnIndexBeforeMove: 1,
        turnIndex: -2,
        endMatchScores: [0, 1],
        lastMove: [{endMatch: {endMatchScores: [0, 1]}},
            {set: {key: 'board', value: board3}},
            {set: {key: 'delta', value: delta3}}],
        lastState: {board: board2, delta: delta2},
        currentState: {board: board3, delta: delta3},
        lastVisibleTo: {},
        currentVisibleTo: {},
    };





    it('can start from a match that is about to end, and win, for sheep', function () {
        setMatchState(matchState21, 'passAndPlay');
        expectBoard(board21);
        clickDivAndExpectPiece(3, 4, "S_trans"); // winning click!
        clickDivAndExpectPiece(2, 4, "S");
        clickDivAndExpectPiece(2, 4, "S"); // can't click after game ended
        expectBoard(board31);
    });


    it('cannot play if it is not your turn', function () {
        // Now make sure that if you're playing "O" (your player index is 1) then
        // you can't do the winning click!
        setMatchState(matchState21, 1); // playMode=1 means that yourPlayerIndex=1.
        expectBoard(board21);
        clickDivAndExpectPiece(3, 4, "S");
        clickDivAndExpectPiece(2, 4, ""); // can't do the winning click!
        expectBoard(board21);
    });


    it('cannot start from a match that ended', function () {
        setMatchState(matchState3, 'passAndPlay');
        expectBoard(board3);
        clickDivAndExpectPiece(0, 2, "S"); // can't click after game ended
        clickDivAndExpectPiece(0, 3, "");
    });


});