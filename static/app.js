/*
* Copyright (c) 2011 Google Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License"); you may not
* use this file except in compliance with the License. You may obtain a copy of
* the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
* WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
* License for the specific language governing permissions and limitations under
* the License.
*/
var serverPath = '//ideatr2472.appspot.com/';
var userTotalVotes = 0;
var userVoteDistribution = {};
var voteCap = 5;
var userHasVoted = false;

var draggingIdeaId = null;
var forbiddenCharacters = '<>';
var numMoveOnVotes = 0;
var userHasVotedToContinue = false;

/*
 * Note that phase changes use the State this version
 */
function phaseButtonClick() {
  numMoveOnVotes++;
  userHasVotedToContinue = true;
  updatePhaseAlerts();
  gapi.hangout.data.sendMessage("move on vote");
  if ( gapi.hangout.getParticipants().length > numMoveOnVotes ) {
    $("#phaseButton").attr("disabled", true);
    return;
  }
  var phase = parseInt(gapi.hangout.data.getState()['phase']);
  var value = 0;
  if (!phase) {
    value = 1;  //Discussion
  } else if (phase === 1) {
    value = 2;  //Voting
  } else {
    value = 3;  //Final Report
  }
  numMoveOnVotes = 0;
  userHasVotedToContinue = false;
  updatePhaseAlerts();
  $("#phaseButton").removeAttr("disabled");
  gapi.hangout.data.sendMessage("about to move on");
  gapi.hangout.data.submitDelta({'phase': '' + value});
}

function startOverButtonClick() {
  if (!confirm("Are you sure you want to start over? You will be returned to Phase 1 and all ideas will be erased.")) {
    return;
  }
  /* 
   * Remove all keys from the state
   * Documentation @ https://developers.google.com/+/hangouts/api/gapi.hangout.data
   */
  var keys = gapi.hangout.data.getKeys();
  console.log('removing all keys: ', keys);
  for ( var i = 0; i < keys.length; i++  ) {
    var key = keys[i];
    gapi.hangout.data.clearValue( key );
  }
}

function getArrayFromState( keyStr ) {
  var arrStr = gapi.hangout.data.getState()[ keyStr ];
  if (arrStr) {
    return JSON.parse(arrStr);
  }
  return [];
}
function addIdeaButtonClick() {
  // Note that if you click the button several times in succession,
  // if the state update hasn't gone through, it will submit the same
  // delta again.  The hangout data state only remembers the most-recent
  // update.
  console.log('Add idea button clicked.');

  var newText = document.getElementById('inputField').value;
  if ( newText.length === 0 ) return;
  /* Sanitize input */
  for ( var i = 0; i < forbiddenCharacters.length; i++ ) {
    if ( newText.indexOf( forbiddenCharacters[i] ) > -1 ) {
      //alert('Your idea may not include any of the following characters: ' + forbiddenCharacters);
      $('#userInputAlert').html('Your idea may not include any of the following characters: ' + forbiddenCharacters);
      return;
    }
  }
  document.getElementById('inputField').value = '';

  var ideasList = getArrayFromState( 'ideas' );
  if ( ideasList.indexOf( newText ) > -1 ) {
    $('#userInputAlert').html('That idea has already been added!');
    return;
  }
  $('#userInputAlert').empty();
  ideasList.push( newText );
  console.log('New ideas list is: ' + ideasList);

  /* Get rid of the initial message if it exists */
  if ( $("#initialMessage").length ) {
    $("#initialMessage").remove();
  }

  var ideasInHtml = $("#ideasPane").children();
  var startIndex = 0;
  if ( ideasInHtml )  startIndex = ideasInHtml.length;

  for (var i = startIndex; i < ideasList.length; i++)  {
    var ideaText = ideasList[i];
    console.log('Checking idea from state: ', ideaText);

    var ideaUl = document.createElement('ul');
    ideaUl.className = 'ideasPaneList';
    var ideaLi = document.createElement('li');
    ideaLi.innerHTML = ideaText;
    ideaLi.className = 'idea';
    ideaLi.id = 'i' + i;  //its position in the list...guaranteed to be unique! :)
    ideaUl.appendChild( ideaLi );
    $('#ideasPane').append( ideaUl );

    ideaSelector = '#' + ideaLi.id;
    $( ideaSelector ).click( expandIdeaClick );
    var phase = gapi.hangout.data.getState()['phase'];
    if ( phase )  phase = parseInt(phase);
    if ( phase === 1 ) {
      console.log('\tMaking the new idea draggable');
      $( ideaSelector ).draggable({
        start: dragStart,
        stop: dragStop,
        containment: $('#ideasPane')
      });
    }
  }

  /* is this the right place for this? */
  var ideasPane = document.getElementById('ideasPane');
  ideasPane.scrollTop = ideasPane.scrollHeight;

  console.log('Submitting delta from addIdeaButtonClick');
  /* Disable the button until the updateStateUi is done? */
  gapi.hangout.data.submitDelta({ 'ideas': JSON.stringify(ideasList), 'ideasPaneHtml': $("#ideasPane").html() });
}

function promptButtonClick() {
  // Note that if you click the button several times in succession,
  // if the state update hasn't gone through, it will submit the same
  // delta again.  The hangout data state only remembers the most-recent
  // update.
  console.log('Prompt button clicked.');
  
  var randNum = Math.floor(Math.random() * (10));

  var newText = '';

  if (randNum === 0) {
    newText = 'Come up with twenty new ideas, as fast as you can!';
  } else if (randNum === 1) {
    newText = 'Come up with as many ideas as you can in the next thirty seconds!';
  } else if (randNum === 2) {
    newText = 'Add some unrealistic ideas!';
  } else if (randNum === 3) {
    newText = 'Add some terrible ideas!';
  } else if (randNum === 4) {
    newText = 'Combine two ideas you already have!';
  } else if (randNum === 5) {
    newText = 'Expand on someone else\'s idea that you like!';
  } else if (randNum === 6) {
    newText = 'Do most of your ideas have something in common? Step outside that box!';
  } else if (randNum === 7) {
    newText = 'Come up with ten new ideas each, as fast as you can!';
  } else if (randNum === 8) {
    newText = 'Come up with as many ideas as you can in the next twenty seconds!';
  } else if (randNum === 9) {
    newText = 'Stand up, stretch, then come up with five new ideas!';
  }

  gapi.hangout.data.submitDelta({'prompt': newText});
}

function setText(element, text) {
  element.innerHTML = typeof text === 'string' ?
      text.replace(forbiddenCharacters, '') :
      '';
}

function expandIdeaClick( event ) {
  console.log('idea clicked');
  var phase = parseInt(gapi.hangout.data.getState()['phase']);
  var idea = event.target;

  if (phase === 1) {
    var selector = '#' + event.target.id;
    if ( $( selector ).hasClass('bigIdea1')) {
      $( selector ).removeClass('bigIdea1');
      $( selector ).addClass('bigIdea2');
    } else if ( $( selector ).hasClass('bigIdea2')) {
      $( selector ).removeClass('bigIdea2');
      $( selector ).addClass('bigIdea3');
    } else if ( $( selector ).hasClass('bigIdea3')) {
      $( selector ).removeClass('bigIdea3');
      $( selector ).addClass('bigIdea4');
    } else if ( $( selector ).hasClass('bigIdea4')) {
      $( selector ).removeClass('bigIdea4');
      $( selector ).addClass('bigIdea5');
    } else if ( $( selector ).hasClass('bigIdea5')) {
      $( selector ).removeClass('bigIdea5');
      $( selector ).addClass('bigIdea6');
    } else if ( $( selector ).hasClass('bigIdea6')) {
      $( selector ).removeClass('bigIdea6');
      $( selector ).addClass('bigIdea1');
    } else {
      $( selector ).addClass('bigIdea1');
    }
    
    gapi.hangout.data.submitDelta({ 'currentIdea': idea.innerHTML, 'ideasPaneHtml': $("#ideasPane").html() });

  } else if (phase === 2) {
    if ( userTotalVotes < voteCap ) {
      var strippedIdea = idea.innerHTML;
      if (strippedIdea.indexOf("*") >= 0) strippedIdea = strippedIdea.substr(0,strippedIdea.indexOf("*"));
      console.log('strippedIdea: ', strippedIdea);
      if (userVoteDistribution[strippedIdea]) {
        userVoteDistribution[strippedIdea] = userVoteDistribution[strippedIdea] + 1;
      } else {
        userVoteDistribution[strippedIdea] = 1;
      }
      idea.innerHTML = idea.innerHTML + "*";
      userTotalVotes++;
      tipBox.innerHTML = 'Remaining Votes: ' + (voteCap - userTotalVotes);
    }
    if ( userTotalVotes === voteCap && !userHasVoted ) {
      var votes = gapi.hangout.data.getState()['votes'];
      if (!votes) votes = {};
      else votes = JSON.parse(votes);
      console.log('votes: ', votes);
      for ( key in userVoteDistribution ) {
        if ( !votes[key] ) votes[key] = userVoteDistribution[key];
        else votes[key] += userVoteDistribution[key];
      }
      userHasVoted = true; //so it won't submit again
      console.log('Submitting votes str: ', JSON.stringify(votes));
      gapi.hangout.data.submitDelta({'votes': JSON.stringify(votes)});
    }
  }
}

function dragStart( event, ui ) {
  console.log('dragging started: ', event.target.id);
  draggingIdeaId = event.target.id;
  selector = "#" + event.target.id;
  $( selector ).draggable( "option", "disabled", true );
  $( selector ).unbind( "click", expandIdeaClick ); //temporarily, so dragging doesn't trigger the click
  var phase = parseInt(gapi.hangout.data.getState()['phase']);
  if ( !phase || phase < 2 ) {
    gapi.hangout.data.sendMessage("DRAGSTART" + event.target.id);
  }
}

function dragStop( event, ui ) {
  console.log('dragging stopped: ', event.target.id);
  draggingIdeaId = null;
  var selector = "#" + event.target.id;
  $( selector ).draggable( "option", "disabled", false );
  $( selector ).click( expandIdeaClick );  //unbound when we started the drag
  var phase = parseInt(gapi.hangout.data.getState()['phase']);
  if ( !phase || phase < 2 ) {
    gapi.hangout.data.sendMessage("DRAGSTOP" + JSON.stringify({ id: event.target.id, top: event.target.style.top, left: event.target.style.left }) );
  }
}

function updateIdeasPane( newHtmlStr, phase ) {
  var parsedHtml = $.parseHTML(newHtmlStr);
  console.log( 'Received new Html: ', parsedHtml );
  for (var h = 0; h < parsedHtml.length; h++) {
    var ideaUl = parsedHtml[h];
    console.log('ideaUl: ', ideaUl)
    if ( ideaUl.className != "ideasPaneList" ) {
      console.log('ERROR: something in the ideasPane is not of the right class: ', ideaUl);
      console.log('\tskipping this element');
      if ( !ideaUl.nodeName === "#text" ) { //this exception is a known issue with using enter to submit on Windows
        alert("Error in updateStateUi: see console log");
      }
      continue;
    }
    if ( ideaUl.children.length > 1 ) {
      console.log('ERROR: an element in the ideasPane has too many children: ', ideaUl);
      console.log('\tskipping this element');
      alert("Error in updateStateUi: see console log");
      continue;
    }
    var ideaLi = ideaUl.children[0];
    if ( draggingIdeaId === ideaLi.id) {  //don't mess with this! user is dragging it
      continue;
    }
    var ideaOnPage = document.getElementById( ideaLi.id );
    var selector = '#' + ideaLi.id;
    if( ideaOnPage ) {
      ideaOnPage.className = ideaLi.className;
      ideaOnPage.innerHTML = ideaLi.innerHTML; //just in case
      if ( ideaOnPage.attributes['style'] ) {
        ideaOnPage.style.cssText = ideaLi.attributes['style'].value;
      }
      /*
      if ($( selector ).hasClass('ui-draggable-disabled')) {
        $( selector ).draggable( "option", "disabled", true );
      } else if ( $( selector ).hasClass('ui-draggable') ) {
        $( selector ).draggable( "option", "disabled", false );
      }
      */
    } else {  //this idea is not already in the HTML on screen
      $( "#ideasPane" ).append(ideaUl);
      $( selector ).click( expandIdeaClick );
    }
  }
  if ( phase ) {
    console.log('Making everything draggable');
    $( '.idea' ).draggable({
      start: dragStart,
      stop: dragStop,
      containment: $('#ideasPane')
    });
  }
}

function processMessage( senderID, messageStr ) {
  console.log('Received message from ' + senderID + '! Message: ' + messageStr);
  if ( messageStr.indexOf('DRAGSTART') > -1 ) {
    var id = messageStr.substr(9);
    $( '#' + id ).draggable( "option", "disabled", true );
    return;
  }
  if ( messageStr.indexOf('DRAGSTOP') > -1 ) {
    var obj = JSON.parse( messageStr.substr(8) );
    var idea = document.getElementById( obj.id );
    idea.style.top = obj.top;
    idea.style.left = obj.left;
    $( '#' + obj.id ).draggable( "option", "disabled", false );
    return;
  }
  if ( messageStr === "about to move on" ) {
    numMoveOnVotes = 0;
    userHasVotedToContinue = false;
    $("#phaseButton").removeAttr("disabled");
  } else if ( messageStr === "move on vote") {
    numMoveOnVotes++;
  }
  updatePhaseAlerts();
}

function updatePhaseAlerts() {
  if ( numMoveOnVotes === 0 ) {
    $("#userPhaseAlert").empty();
  } else if ( numMoveOnVotes === 1 ) {
    $("#userPhaseAlert").html( '1 user is ready to move on!' );
  } else {
    $("#userPhaseAlert").html( numMoveOnVotes + ' users are ready to move on!' );
  }
}

function updateStateUi(state) {
  console.log('Called updateStateUi');
  var statePhase = parseInt(state['phase']);

  /* Update ideasPane */
  if ( !statePhase || statePhase < 2 ) {
    var newHtmlStr = state['ideasPaneHtml'];
    if ( newHtmlStr ) {
      /* Get rid of the initial message if it exists */
      if ( $("#initialMessage").length ) {
        $("#initialMessage").remove();
      }
      updateIdeasPane( newHtmlStr, statePhase );
    } else {  //there was no HTML in the state
      $("#ideasPane").empty();
      $("#ideasPane").html('<dd id="initialMessage">YOUR IDEAS WILL APPEAR HERE. COME UP WITH AS MANY AS YOU CAN!</dd>');
      userTotalVotes = 0;
      userVoteDistribution = {};
      userHasVoted = false;
      draggingIdeaId = null;
      numMoveOnVotes = 0;
      userHasVotedToContinue = false;
      updatePhaseAlerts();
      $("#phaseButton").removeAttr("disabled");
    }
  }

  /* Update other stuff: */
  if (!statePhase) {
    var button = document.getElementById('phaseButton');
    button.value = 'Next (Discuss)';
    var title = document.getElementById('title');
    setText(title, 'Phase 1: Brainstorm');
    var topBar = document.getElementById('topBar');
    topBar.style.backgroundColor = "#CAE1FF";
    var tipBox = document.getElementById('tipBox');
    if (!state['ideas']) {
      tipBox.innerHTML = 'Add as many ideas as you can, as quickly as you can!';
    } else {
      if (!state['prompt']) {
        tipBox.innerHTML = 'Need help? <input type=button value="Get a prompt" id="promptButton" onClick="promptButtonClick()"/>';
      } else {
        tipBox.innerHTML = state['prompt'] + ' <input type=button value="Get a new prompt" id="promptButton" onClick="promptButtonClick()"/>';
      }
    }
    $( "#addIdeaButton" ).show();
    $( "#inputField" ).show();
    $( "#phaseButton" ).show();
    $( "#tipBox" ).show();
  } else if (statePhase === 1) {
    var button = document.getElementById('phaseButton');
    button.value = 'Next (Vote)';
    var title = document.getElementById('title');
    setText(title, 'Phase 2: Discuss');
    
    var tipBox = document.getElementById('tipBox');
    if (!state['currentIdea']) {
      tipBox.innerHTML = 'Click on an idea to highlight it, and drag to organize your thoughts!';
      tipBox.style.visibility = '';
    } else {
      tipBox.innerHTML = state['currentIdea'];
    }
    var topBar = document.getElementById('topBar');
    topBar.style.backgroundColor = "#E1FFCA";
  } else if (statePhase === 2) {
    var button = document.getElementById('phaseButton');
    button.value = 'Done';
    var title = document.getElementById('title');
    setText(title, 'Phase 3: Vote');
    var topBar = document.getElementById('topBar');
    topBar.style.backgroundColor = "#FFCAE1";
    var tipBox = document.getElementById('tipBox');
    if ( userTotalVotes === 0 ) {
      tipBox.innerHTML = 'Click on an idea to vote for it! You get 5 votes, and only you will be able to see them.';
    } else {
      tipBox.innerHTML = 'Remaining Votes: ' + (voteCap - userTotalVotes);
    }
    $( "#addIdeaButton" ).hide();
    $( "#inputField" ).hide();
  } else if (statePhase === 3){
    var topBar = document.getElementById('topBar');
    topBar.style.backgroundColor = "#E1CAFF";
    var title = document.getElementById('title');
    setText(title, 'Done! Your top voted ideas:');
    var votes = state['votes'];
    if (votes) {
      votes = JSON.parse(votes);
      var sortable_ideas = [];
      for (var key in votes) {
        sortable_ideas.push([key, votes[key]]);
      }
      sortable_ideas.sort(function(a, b) {
        return b[1]-a[1];
      });
      console.log(sortable_ideas);
      var internalValue = '';
      for (i = 0; i < sortable_ideas.length; i++) {
        internalValue = internalValue + '<li class="finalIdea">' + sortable_ideas[i][0] + ' (votes: ' + sortable_ideas[i][1] + ')</li>';
      }
      console.log('Final internal value: ', internalValue);
      $("#ideasPane").empty();
      var finalList = document.createElement('ul');
      finalList.id = 'finalIdeasList';
      finalList.className = 'ideasPaneList';
      finalList.innerHTML = internalValue;
      $("#ideasPane").append(finalList);
    } else {
      console.log("ERROR: entered phase 3 and no votes were found in the state");
      //alert("Error: check console output");
    }
    $("#tipBox").hide();
    $("#phaseButton").hide();
  }
}

function updateParticipantsUi(participants) {
  console.log('Participants count: ' + participants.length);
  var participantsListElement = document.getElementById('participants');
  setText(participantsListElement, participants.length.toString());
}

// A function to be run at app initialization time which registers our callbacks
function init() {
  console.log('Init app.');

  var apiReady = function(eventObj) {
    if (eventObj.isApiReady) {
      console.log('API is ready');

      gapi.hangout.data.onStateChanged.add(function(eventObj) {
        updateStateUi(eventObj.state);
      });
      gapi.hangout.data.onMessageReceived.add(function(messageObj) {
        processMessage( messageObj.senderId, messageObj.message );
      });
      gapi.hangout.onParticipantsChanged.add(function(eventObj) {
        updateParticipantsUi(eventObj.participants);
      });

      updateStateUi(gapi.hangout.data.getState());
      updateParticipantsUi(gapi.hangout.getParticipants());

      gapi.hangout.onApiReady.remove(apiReady);
    }
  };

  // This application is pretty simple, but use this special api ready state
  // event if you would like to any more complex app setup.
  gapi.hangout.onApiReady.add(apiReady);
}

gadgets.util.registerOnLoadHandler(init);
