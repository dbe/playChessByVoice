// [START app]
'use strict';

process.env.DEBUG = 'actions-on-google:*';

let Assistant = require('actions-on-google').ApiAiAssistant;
let express = require('express');
let bodyParser = require('body-parser');
let FEN = require('chesslib').FEN;
let playMove = require('./playMove');

let app = express();
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

app.get('/', function(request, response) {
  response.send("Homepage of the Play Chess By Voice program.");
});

app.post('/', function (request, response) {
  const assistant = new Assistant({request: request, response: response});

  let actionMap = new Map();
  actionMap.set(LETS_PLAY_INTENT, letsPlayIntent);
  actionMap.set(RESIGN_INTENT, resignIntent);
  actionMap.set(PLAY_MOVE_INTENT, playMoveIntent);

  assistant.handleRequest(actionMap);


  function letsPlayIntent(assistant) {
    //TODO: Start game against computer, save info in db
    console.log("OREO: Inside LetsPlayIntent. TODO: Game started and id's saved");

    let side = assistant.getArgument(SIDE_ARGUMENT);

    if(side == 'white') {
      assistant.ask("Ok, you are white. What is your first move?");
    } else {
      //TODO: Start game
      assistant.ask("Ok, you are black. My first move is E 4");
    }
  }
  
  function resignIntent(assistant) {
    //TODO: Mark game as completed
    console.log("OREO: Inside Resign Intent");
  }

  function playMoveIntent(assistant) {
    console.log("OREO: Inside playMoveIntent");

    var pos = FEN.parse("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

    var bestMove = playMove(pos, "e4");

    bestMove.then(function(bestmove) {
      console.log("In the resolution of bestMove. Best move: ", bestmove);
      assistant.ask("Ok I play " + bestMove);
    });
  }

  /*
  function mainIntent (assistant) {
    let inputPrompt = assistant.buildInputPrompt(true,
          '<speak>Hi! Would you like to play as black or white' +
          'I can read out an ordinal like ' +
          '<say-as interpret-as="ordinal">123</say-as>. Say a number.</speak>',
          ['I didn\'t hear a number', 'If you\'re still there, what\'s the number?', 'What is the number?']);
    assistant.ask(inputPrompt);
  }

  function rawInput (assistant) {
    console.log('rawInput');
    if (assistant.getRawInput() === 'bye') {
      assistant.tell('Goodbye!');
    } else {
      let inputPrompt = assistant.buildInputPrompt(true, '<speak>You said, <say-as interpret-as="ordinal">' +
        assistant.getRawInput() + '</say-as></speak>',
          ['I didn\'t hear a number', 'If you\'re still there, what\'s the number?', 'What is the number?']);
      assistant.ask(inputPrompt);
    }
  }
  */

});

// Start the server
let server = app.listen(app.get('port'), function () {
  console.log('App listening on port %s', server.address().port);
  console.log('Press Ctrl+C to quit.');
});
// [END app]
