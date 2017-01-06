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
      console.log("Loaded game from db");

      var desiredMove = extractDesiredMove(assistant);
      console.log("desiredMove: ", desiredMove);

      var game = new Chess(gameData.fen);

      console.log("Game: ", game);

      var move = game.move(desiredMove);

      console.log("Made move: ", move);

      //TODO: Handle calcing the best move and making it

      console.log("About to persist updated game");
      Persistance.persistGame(game, userId);

      assistant.ask("Ok, you moved: " + moveUtil.moveToSpeech(move));
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
