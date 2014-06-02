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
var voteCap = 5; 

var numIdeasPerColumn = 1;
var draggingIdeaId = null;
var lastUiUpdateTime = 0;

function phaseButtonClick() {
  if (confirm("You are attempting to move to the next phase of the brainstorming process -- make sure the rest of your group is ready first! Press OK to move to the next phase.") == false) {
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

  gapi.hangout.data.submitDelta({'phase': '' + value});
}

function startOverButtonClick() {
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

//take a string of HTML list item elements, and return an array of each list item HTML
function arrayFromListItemString(str) {
  var arr = [];
  while (str != '') {
    var listItemEndIndex = str.indexOf('</li>') + 5;  //first occurence of specified string + length of that string
    curIdeaItem = str.substr(0, listItemEndIndex);
    console.log(curIdeaItem);
    str = str.substr(listItemEndIndex);  //cut off the list item we just extracted
    arr.push(curIdeaItem);
  }
  return arr;
}

function addIdeaButtonClick() {
  // Note that if you click the button several times in succession,
  // if the state update hasn't gone through, it will submit the same
  // delta again.  The hangout data state only remembers the most-recent
  // update.
  console.log('Add idea button clicked.');
  var value = '';

  var newText = document.getElementById('inputField').value;
  document.getElementById('inputField').value = '';

  var ideasList = gapi.hangout.data.getState()['ideas'];
  if (ideasList) {
    ideasList = JSON.parse(ideasList);
    ideasList.push(newText);
  } else {
    ideasList = [newText];
  }
  console.log('New ideasList is ' + ideasList);

  if (ideasList.length === 1) {
    $("#initialMessage").remove(); //make sure there's nothing hanging around
  }
  var lists = $("#ideasPane").children();
  curList = $("#ideasList" + lists.length); //get the proper list to put the new idea in
  var children = curList.children();
  var startIndex = 0; //in ideasList
  if ( children ) {
    startIndex = children.length + (lists.length - 1) * numIdeasPerColumn;
  }
  for (var i = startIndex; i < ideasList.length; i++)  {
    var ideaText = ideasList[i];
    console.log(ideaText);
    var item = document.createElement('li');
    item.innerHTML = ideaText;
    item.className = 'idea';
    item.id = 'i' + i;  //its position in the list...guaranteed to be unique! :)
    curList.append(item);
    $( '#' + item.id ).click( expandIdeaClick );
    var phase = gapi.hangout.data.getState()['phase'];
    if ( phase ) phase = parseInt(phase);
    if ( phase === 1 ) {
      console.log('\tyes');
      $( '#' + item.id ).draggable({
        start: dragStart,
        stop: dragStop
      });
    }
  }
  //!!!!!
  if ( curList.children().length === numIdeasPerColumn ) {
    console.log('****Making a new list!!!');
    var newList = document.createElement('ul');
    newList.id = 'ideasList' + (lists.length + 1);
    newList.className = 'ideasPaneList';
    $('#ideasPane').append( newList );
  }
  //is this the right place for this?
  var ideasPane = document.getElementById('ideasPane');
  ideasPane.scrollTop = ideasPane.scrollHeight;
  
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
/*
function addNoteButtonClick() {
  console.log('Add note button clicked.');
  var inputNote = document.getElementById('noteInputField');
  var value = inputNote.value;
  inputNote.value = '';
  console.log('New note is ' + value);
  // Send update to shared state.
  // NOTE:  Only ever send strings as values in the key-value pairs

  var notes = gapi.hangout.data.getState()['notes'];
    if (!notes) notes = {};
    else notes = JSON.parse(notes);
  var currIdea = gapi.hangout.data.getState()['currentIdea'];
    if (notes[currIdea]) {
      notes[currIdea].push(value);
    } else {
      var noteArray = [value];
      notes[currIdea] = noteArray;
    }
  gapi.hangout.data.submitDelta({'notes': JSON.stringify(notes)});
}
*/

// var forbiddenCharacters = /[^a-zA-Z!0-9_\- ]/;
var forbiddenCharacters = "";
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

  } else if (phase === 2 && userTotalVotes < voteCap) {
    userTotalVotes++;
    var votes = gapi.hangout.data.getState()['votes'];
    if (!votes) votes = {};
    else votes = JSON.parse(votes);
    console.log(votes);
    var strippedIdea = idea.innerHTML;
    if (strippedIdea.indexOf("*") >= 0) strippedIdea = strippedIdea.substr(0,strippedIdea.indexOf("*"));
    console.log(strippedIdea);
    if (votes[strippedIdea]) {
      votes[strippedIdea] = votes[strippedIdea] + 1;
    } else {
      votes[strippedIdea] = 1;
    }
    idea.innerHTML = idea.innerHTML + "*";

    console.log(JSON.stringify(votes));

    gapi.hangout.data.submitDelta({'votes': JSON.stringify(votes)});
  }
}

function getMessageClick() {
  console.log('Requesting message from main.py');
  var http = new XMLHttpRequest();
  http.open('GET', serverPath);
  http.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var jsonResponse = JSON.parse(http.responseText);
      console.log(jsonResponse);

      var messageElement = document.getElementById('message');
      setText(messageElement, jsonResponse['message']);
    }
  }
  http.send();
}


$( document ).ready(function() {
    console.log("Document ready (JQuery working)");
});

function dragStart( event, ui ) {
  console.log('dragging started: ', event.target.id);
  draggingIdeaId = event.target.id;
  selector = "#" + event.target.id;
  $( selector ).draggable( "option", "disabled", true );
  $( selector ).unbind( "click", expandIdeaClick ); //temporarily, so dragging doesn't trigger the click
  updateHtml();
}

//useful example?
//console.log('\t', $('#'+event.target.id)[0].outerHTML);
function dragStop( event, ui ) {
  console.log('dragging stopped: ', event.target.id);
  draggingIdeaId = null;
  var selector = "#" + event.target.id;
  $( selector ).draggable( "option", "disabled", false );
  updateHtml();
  $( selector ).click( expandIdeaClick );  //unbound when we started the drag
}

function updateHtml() {
  gapi.hangout.data.submitDelta({ 'ideasPaneHtml': $("#ideasPane").html() })
}

function updateStateUi(state) {
  lastUiUpdateTime = (new Date()).getTime();
  console.log('Called updateStateUi');
  var statePhase = parseInt(state['phase']);

  if ( !statePhase || statePhase < 2 ) {
    //Update ideas pane view:
    var newHtmlStr = state['ideasPaneHtml'];
    if ( newHtmlStr ) {
      var parsedHtml = $.parseHTML(newHtmlStr);
      console.log( 'Received new Html: ', parsedHtml );
      /*
      parsedHtml = parsedHtml[1];
      if (parsedHtml.id != 'ideasList1') {
        console.log('ERROR: bad HTML received in updateStateUi');
      }
      console.log( 'Received new Html: ', parsedHtml );
      */

      for (var h = 0; h < parsedHtml.length; h++) {
      var nodes = parsedHtml[h];
      if ( nodes.nodeName === "#text" ) {   //why does this even happen?
        continue;
      }
      console.log('processing nodes: ', nodes);
      //var nodes = parsedHtml.childNodes;
      for (var i = 0; i < nodes.length; i++ ) {
        var item = nodes[i];
        var id = item.attributes['id'].value;
        if ( draggingIdeaId === id ) {  //don't mess with this! (user is dragging it)
          continue;
        }
        var oldItem = document.getElementById( id );
        var selector = '#' + id;
        if ( oldItem ) {  //something was modified
          oldItem.className = item.attributes['class'].value;
          if ( item.attributes['style'] ) {
            oldItem.style.cssText = item.attributes['style'].value;
          }
          oldItem.innerHTML = item.innerHTML; //just in case
          if ($( selector ).hasClass('ui-draggable-disabled')) {
            $( selector ).draggable( "option", "disabled", true );
          } else if ( $( selector ).hasClass('ui-draggable') ) {
            $( selector ).draggable( "option", "disabled", false );
          }
        } else {    //something was added
          var ideasList = JSON.parse(state['ideas']);
          if (ideasList.length === 1) {
            $("#ideasList1").empty(); //make sure there's nothing hanging around
          }
          $("#ideasList1").append(item);
          $( selector ).click( expandIdeaClick );
        }
      }

      }

      if ( statePhase ) {
        console.log('**making everything draggable');
        $( '.idea' ).draggable({
          start: dragStart,
          stop: dragStop
        });
      }
    } else { 
      $("#ideasPane").empty();
      $("#ideasPane").html('<dd id="initialMessage">YOUR IDEAS WILL APPEAR HERE. COME UP WITH AS MANY AS YOU CAN!</dd>');
      var firstList = document.createElement('ul');
      firstList.id = 'ideasList1';
      firstList.className = 'ideasPaneList';
      $("#ideasPane").append(firstList);
    }
  }

  //update other stuff:
  
  console.log('Phase:' + statePhase);
  if (!statePhase) {
    var button = document.getElementById('phaseButton');
    button.value = 'Next (Discuss)';
    var title = document.getElementById('title');
    setText(title, 'Phase 1: Brainstorm');
    var topBar = document.getElementById('topBar');
    topBar.style.backgroundColor = "#CAE1FF";
    $( "#addIdeaButton" ).show();
    $( "#inputField" ).show();
    $( "#phaseButton" ).show();
    $( "#tipBox" ).show();

    var tipBox = document.getElementById('tipBox');
    if (!state['ideas']) {
      tipBox.innerHTML = 'Add as many ideas as you can, as quickly as you can! --->';
    } else {
      if (!state['prompt']) {
        tipBox.innerHTML = 'Need help? <input type=button value="Get a prompt" id="promptButton" onClick="promptButtonClick()"/>';
      } else {
        tipBox.innerHTML = state['prompt'] + ' <input type=button value="Get a new prompt" id="promptButton" onClick="promptButtonClick()"/>';
      }
    }
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
    // change button
    // update everything else in UI (title, voting)
  } else if (statePhase === 2) {
    var button = document.getElementById('phaseButton');
    button.value = 'Done';
    var title = document.getElementById('title');
    setText(title, 'Phase 3: Vote');
    $( "#addIdeaButton" ).hide();
    $( "#inputField" ).hide();

    var topBar = document.getElementById('topBar');
    topBar.style.backgroundColor = "#FFCAE1";

    var tipBox = document.getElementById('tipBox');
    if ( userTotalVotes === 0 ) {
      tipBox.innerHTML = 'Click on an idea to vote for it! You get five votes, and only you will be able to see them.';
    } else {
      tipBox.innerHTML = 'Remaining Votes: ' + (voteCap - userTotalVotes);
    }

    // you're done... final report
  } else if (statePhase === 3){
    var topBar = document.getElementById('topBar');
    topBar.style.backgroundColor = "#E1CAFF";
    var title = document.getElementById('title');
    setText(title, 'Done! Your top voted ideas:');

    $("#tipBox").hide();
    $("#phaseButton").hide();

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
      $("#ideasPane").empty();
      var firstList = document.createElement('ul');
      firstList.id = 'finalIdeasList';
      firstList.className = 'ideasPaneList';
      $("#ideasPane").append(firstList);
      $("#finalIdeasList").html( internalValue );
      console.log(internalValue);
    }
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
