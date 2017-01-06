// [START app]
'use strict';

process.env.DEBUG = 'actions-on-google:*';

var Assistant = require('actions-on-google').ApiAiAssistant;
var express = require('express');
var bodyParser = require('body-parser');
var Chess = require('chess.js').Chess;

var moveUtil = require('./moveUtil');
var Persistance = require('./persistance');

var app = express();
app.set('port', (process.env.PORT || 8080));
app.use(bodyParser.json({type: 'application/json'}));


// API.AI Intents
const LETS_PLAY_INTENT = 'lets_play';
const RESIGN_INTENT = 'resign';
const PLAY_MOVE_INTENT = 'play_move';

// API.AI Arguments
const SIDE_ARGUMENT = 'side';
const PIECE_ARGUMENT = 'piece';
const FILE_ARGUMENT = 'file';
const RANK_ARGUMENT = 'rank';
const DISAMBIGUATION_FILE_ARGUMENT = 'disambiguation_file';
const DISAMBIGUATION_RANK_ARGUMENT = 'disambiguation_rank';

//Constants
const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

app.get('/', function(request, response) {
  response.send("Homepage of the Play Chess By Voice program.");
});

app.post('/', function (request, response) {
  const assistant = new Assistant({request: request, response: response});

  var actionMap = new Map();
  actionMap.set(LETS_PLAY_INTENT, letsPlayIntent);
  actionMap.set(RESIGN_INTENT, resignIntent);
  actionMap.set(PLAY_MOVE_INTENT, playMoveIntent);

  assistant.handleRequest(actionMap);


  //TODO: Handle case where user already has a game started.
  function letsPlayIntent(assistant) {
    var side = assistant.getArgument(SIDE_ARGUMENT);
    var game = initNewGame();
    var userId = extractUserId(assistant);

    if(side == 'white') {
      assistant.ask("Ok, you are white. What is your first move?");
    } else {
      moveUtil.calcBestMove(game).then(function(bestMove) {
        var move = game.move(bestMove);

        //TODO: Handle case where move is null due to bad move
        if(move == null) {
          console.log("ERROR! MOVE WAS NULL");
        }

        assistant.ask("Ok, you are black. My first move is " + moveUtil.moveToSpeech(move));
      });
    }

    //TODO: Careful here to make sure this happens even after the assisntant.ask
    console.log("Saving to DB");
    Persistance.persistGame(game, userId);
  }
  
  function resignIntent(assistant) {
    //TODO: Mark game as completed
  }

  function playMoveIntent(assistant) {
    var userId = extractUserId(assistant);

    Persistance.getGame(userId).then(function(gameData) {
      var desiredMove = extractDesiredMove(assistant);
      var game = new Chess(gameData.fen);
      var humanMove = game.move(desiredMove);

      //TODO: Improve this UX
      if(humanMove == null) {
        assistant.ask("That move is illegal. Try again");
      }

      console.log("Human made move: ", moveUtil.moveToSpeech(humanMove));

      moveUtil.calcBestMove(game).then(function(bestMove) {
        console.log("Got best Move: ", bestMove);

        var computerMove = game.move(bestMove);

        console.log("computerMove: ", computerMove);

        console.log("About to persist");

        Persistance.persistGame(game, userId);

        console.log("After persist, about to ask user");

        assistant.ask("Ok, you moved: " + moveUtil.moveToSpeech(humanMove) + ". My move is: " + moveUtil.moveToSpeech(computerMove));
      });
    });
  }

  //TODO: Acutally get the user ID
  function extractUserId(assisant) {
    return 1;
  }

  function extractDesiredMove(assistant) {
    //TODO: Make this acutally parse the desired move
    return 'e4';
  }

  function initNewGame() {
    return new Chess();
  }

});

// Start the server
var server = app.listen(app.get('port'), function () {
  console.log('App listening on port %s', server.address().port);
  console.log('Press Ctrl+C to quit.');
});
// [END app]
