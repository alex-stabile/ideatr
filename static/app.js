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
var serverPath = '//ideatr247.appspot.com/';
var userTotalVotes = 0;
var voteCap = 5; 

function phaseButtonClick() {
  var phase = parseInt(gapi.hangout.data.getState()['phase']);
  var value = 0;
  if (!phase) {
    // update everything else in UI (title, making ideas clickable)
    value = 1;
  } else if (phase === 1) {
    // change button
    // update everything else in UI (title, voting)
    value = 2;
  } else {
    // you're done... final report
    value = 3;
  }

  gapi.hangout.data.submitDelta({'phase': '' + value});
}

//Sort the list of ideas based on their Class
function sortButtonClick() {
  console.log('sorting ideas');
  var ideasList = gapi.hangout.data.getState()['count'];
  var ideasArr = arrayFromListItemString(ideasList);
  //create a dictionary where a Key is a class and its corresponding Value is an array of the list items with that class
  var classItemsDict = {}
  for (var i = 0; i < ideasArr.length; i++) {
    //example list item:   <li class="bigIdea3" onclick="expandIdeaClick()">a</li> 
    item = ideasArr[i];
    var startIndex = item.indexOf("class") + 7;
    var endIndex = item.indexOf("onclick") - 2
    var className = item.substr(startIndex, endIndex - startIndex);
    if (className.indexOf(' ') > -1) {  //this item has multiple classes
      className = className.substr(0, className.indexOf(' '));  //the color/category class should be the first one
    }
    if (!classItemsDict[className]) {
      classItemsDict[className] = [item];
    } else {
      classItemsDict[className].push(item);
    }
  }
  //turn classItemsDict into a proper string of HTML
  sortedListStr = '';
  for (var key in classItemsDict) {
    var value = classItemsDict[key];
    for (var i = 0; i < value.length; i++) {
      sortedListStr += value[i];
    }
  }
  console.log('sorted ideas: ', sortedListStr);
  gapi.hangout.data.submitDelta({'count': sortedListStr});
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

// Actually invoked when the user clicks "Add Idea"
function countButtonClick() {
  // Note that if you click the button several times in succession,
  // if the state update hasn't gone through, it will submit the same
  // delta again.  The hangout data state only remembers the most-recent
  // update.
  console.log('Add idea button clicked.');
  var value = '';
  var count = gapi.hangout.data.getState()['count'];
  var newText = document.getElementById('inputField').value;
  document.getElementById('inputField').value = '';
  if (count) {
    value = count + '<li class="idea" onClick="expandIdeaClick()">' + newText + '</li>';
  } else {
    value = '<li class="idea" onClick="expandIdeaClick()">' + newText + '</li>';
  }
  

  console.log('New count is ' + value);
  // Send update to shared state.
  // NOTE:  Only ever send strings as values in the key-value pairs
  gapi.hangout.data.submitDelta({'count': value});
}

function assignCategoryToIdea(category, ideaName) {
  var ideasList = document.getElementById('count');
  ideasList = ideasList.childNodes;
  for (var i = 0; i < ideasList.length; i++) {
    var elem = ideasList[i];
    if (elem.innerHTML === ideaName) {
      elem.className = category;
    }
  }
}

function categoryButton1Click() {
  // Note that if you click the button several times in succession,
  // if the state update hasn't gone through, it will submit the same
  // delta again.  The hangout data state only remembers the most-recent
  // update.
  console.log('Category 1 button clicked.');
  var inputCategory = document.getElementById('category1');
  var value = inputCategory.value;
  console.log('New category is ' + value);
  // Send update to shared state.
  // NOTE:  Only ever send strings as values in the key-value pairs
  gapi.hangout.data.submitDelta({'category1': value});
}

function categoryChooseButton1Click() {
  console.log('category 1 chosen');
  var chosenIdea = gapi.hangout.data.getState()['currentIdea'];
  assignCategoryToIdea('bigIdea1', chosenIdea);
  gapi.hangout.data.submitDelta({'count': document.getElementById('count').innerHTML});
}

function categoryButton2Click() {
  // Note that if you click the button several times in succession,
  // if the state update hasn't gone through, it will submit the same
  // delta again.  The hangout data state only remembers the most-recent
  // update.
  console.log('Category 2 button clicked.');
  var inputCategory = document.getElementById('category2');
  var value = inputCategory.value;
  console.log('New category is ' + value);
  // Send update to shared state.
  // NOTE:  Only ever send strings as values in the key-value pairs
  gapi.hangout.data.submitDelta({'category2': value});
}

function categoryChooseButton2Click() {
  console.log('category 2 chosen');
  var chosenIdea = gapi.hangout.data.getState()['currentIdea'];
  assignCategoryToIdea('bigIdea2', chosenIdea);
  gapi.hangout.data.submitDelta({'count': document.getElementById('count').innerHTML});
}

function categoryButton3Click() {
  // Note that if you click the button several times in succession,
  // if the state update hasn't gone through, it will submit the same
  // delta again.  The hangout data state only remembers the most-recent
  // update.
  console.log('Category 3 button clicked.');
  var inputCategory = document.getElementById('category3');
  var value = inputCategory.value;
  console.log('New category is ' + value);
  // Send update to shared state.
  // NOTE:  Only ever send strings as values in the key-value pairs
  gapi.hangout.data.submitDelta({'category3': value});
}

function categoryChooseButton3Click() {
  console.log('category 3 chosen');
  var chosenIdea = gapi.hangout.data.getState()['currentIdea'];
  assignCategoryToIdea('bigIdea3', chosenIdea);
  gapi.hangout.data.submitDelta({'count': document.getElementById('count').innerHTML});
}

function categoryButton4Click() {
  // Note that if you click the button several times in succession,
  // if the state update hasn't gone through, it will submit the same
  // delta again.  The hangout data state only remembers the most-recent
  // update.
  console.log('Category 4 button clicked.');
  var inputCategory = document.getElementById('category4');
  var value = inputCategory.value;
  console.log('New category is ' + value);
  // Send update to shared state.
  // NOTE:  Only ever send strings as values in the key-value pairs
  gapi.hangout.data.submitDelta({'category4': value});
}

function categoryChooseButton4Click() {
  console.log('category 4 chosen');
  var chosenIdea = gapi.hangout.data.getState()['currentIdea'];
  assignCategoryToIdea('bigIdea4', chosenIdea);
  gapi.hangout.data.submitDelta({'count': document.getElementById('count').innerHTML});
}

function categoryButton5Click() {
  // Note that if you click the button several times in succession,
  // if the state update hasn't gone through, it will submit the same
  // delta again.  The hangout data state only remembers the most-recent
  // update.
  console.log('Category 5 button clicked.');
  var inputCategory = document.getElementById('category5');
  var value = inputCategory.value;
  console.log('New category is ' + value);
  // Send update to shared state.
  // NOTE:  Only ever send strings as values in the key-value pairs
  gapi.hangout.data.submitDelta({'category5': value});
}
function categoryChooseButton5Click() {
  console.log('category 5 chosen');
  var chosenIdea = gapi.hangout.data.getState()['currentIdea'];
  assignCategoryToIdea('bigIdea5', chosenIdea);
  gapi.hangout.data.submitDelta({'count': document.getElementById('count').innerHTML});
}

function categoryButton6Click() {
  // Note that if you click the button several times in succession,
  // if the state update hasn't gone through, it will submit the same
  // delta again.  The hangout data state only remembers the most-recent
  // update.
  console.log('Category 6 button clicked.');
  var inputCategory = document.getElementById('category6');
  var value = inputCategory.value;
  console.log('New category is ' + value);
  // Send update to shared state.
  // NOTE:  Only ever send strings as values in the key-value pairs
  gapi.hangout.data.submitDelta({'category6': value});
}
function categoryChooseButton6Click() {
  console.log('category 6 chosen');
  var chosenIdea = gapi.hangout.data.getState()['currentIdea'];
  assignCategoryToIdea('bigIdea6', chosenIdea);
  gapi.hangout.data.submitDelta({'count': document.getElementById('count').innerHTML});
}

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

// var forbiddenCharacters = /[^a-zA-Z!0-9_\- ]/;
var forbiddenCharacters = "";
function setText(element, text) {
  element.innerHTML = typeof text === 'string' ?
      text.replace(forbiddenCharacters, '') :
      '';
}

function expandIdeaClick() {
  var phase = parseInt(gapi.hangout.data.getState()['phase']);
  var idea = event.target;

  if (phase === 1) {
    if (!idea.style.fontSize) {
      idea.style.fontSize = '110%';
    } else if (idea.style.fontSize === '110%') {
      idea.style.fontSize = '120%';
    } else if (idea.style.fontSize === '120%') {
      idea.style.fontSize = '130%';
    } else if (idea.style.fontSize === '130%') {
      idea.style.fontSize = '140%';
    } else if (idea.style.fontSize === '140%') {
      idea.style.fontSize = '150%';
    } else if (idea.style.fontSize === '150%') {
      idea.style.fontSize = '160%';
    } else if (idea.style.fontSize === '160%') {
      idea.style.fontSize = '170%';
    }

    console.log(idea.innerHTML);
    
    var ideaList = event.target.parentNode.innerHTML;
    ideaList.replace("\"", "\\\"");

    gapi.hangout.data.submitDelta({'currentIdea': idea.innerHTML});

    gapi.hangout.data.submitDelta({'count': ideaList});
  } else if (phase === 2 && userTotalVotes < voteCap) {
    userTotalVotes ++;
    var votes = gapi.hangout.data.getState()['votes'];
    if (!votes) votes = {};
    else votes = JSON.parse(votes);
    console.log(votes);
    var strippedIdea = idea.innerHTML;
    if (strippedIdea.indexOf("*") >= 0) strippedIdea = strippedIdea.substr(0,strippedIdea.indexOf("*"));
    console.log(strippedIdea);
    if (votes[strippedIdea]) {
      //if (votes[strippedIdea] > 4) return;
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

function updateStateUi(state) {
  var countElement = document.getElementById('count');
  var stateCount = state['count'];
  var statePhase = parseInt(state['phase']);
  console.log('Phase:' + statePhase);

  if (!stateCount) {
    setText(countElement, 'YOUR IDEAS WILL APPEAR HERE. COME UP WITH AS MANY AS YOU CAN!');
  } else if (!statePhase || statePhase < 2) {
    setText(countElement, stateCount.toString());
  }

  if (!statePhase) {
    var button = document.getElementById('phaseButton');
    button.value = 'Start Discussion';
    var title = document.getElementById('title');
    setText(title, 'Phase 1: Brainstorm ideas');

  } else if (statePhase === 1) {
    var button = document.getElementById('phaseButton');
    button.value = 'Start Voting';
    var title = document.getElementById('title');
    setText(title, 'Phase 2: Discussion');
    var currentIdea = document.getElementById('currentIdea');
    currentIdea.style.border = "1px solid black";
    if (!state['currentIdea']) {
      setText(currentIdea, 'Click on an idea to discuss!');
      var notePanel = document.getElementById('notePanel');
      notePanel.style.visibility = 'hidden';
    } else {
      setText(currentIdea, state['currentIdea']);
      var notePanel = document.getElementById('notePanel');
      notePanel.style.visibility = '';
    }
    var topBar = document.getElementById('topBar');
    topBar.style.backgroundColor = "#E1FFCA";

    var sideBarDiv = document.getElementById('categoryAndNotes');
    sideBarDiv.style.visibility = '';

    if (state['category1']) {
      console.log(state['category1']);
      var categoryKey = document.getElementById('category1Key');
      categoryKey.innerHTML = state['category1'] + 
        ' <input type=button value="Assign" id="category1ChooseButton" onClick="categoryChooseButton1Click()"/>';
    }
    if (state['category2']) {
      console.log(state['category2']);
      var categoryKey = document.getElementById('category2Key');
      categoryKey.innerHTML = state['category2'] + 
        ' <input type=button value="Assign" id="category2ChooseButton" onClick="categoryChooseButton2Click()"/>';
    }
    if (state['category3']) {
      console.log(state['category3']);
      var categoryKey = document.getElementById('category3Key');
      categoryKey.innerHTML = state['category3'] + 
        ' <input type=button value="Assign" id="category3ChooseButton" onClick="categoryChooseButton3Click()"/>';
    }
    if (state['category4']) {
      console.log(state['category4']);
      var categoryKey = document.getElementById('category4Key');
      categoryKey.innerHTML = state['category4'] + 
        ' <input type=button value="Assign" id="category4ChooseButton" onClick="categoryChooseButton4Click()"/>';
    }
    if (state['category5']) {
      console.log(state['category5']);
      var categoryKey = document.getElementById('category5Key');
      categoryKey.innerHTML = state['category5'] + 
        ' <input type=button value="Assign" id="category5ChooseButton" onClick="categoryChooseButton5Click()"/>';
    }
    if (state['category6']) {
      console.log(state['category6']);
      var categoryKey = document.getElementById('category6Key');
      categoryKey.innerHTML = state['category6'] + 
        ' <input type=button value="Assign" id="category6ChooseButton" onClick="categoryChooseButton6Click()"/>';
    }

    if (state['notes'] && state['currentIdea']) {
      var notes = JSON.parse(state['notes']);
      console.log(notes);
      var noteDisplay = document.getElementById('noteDisplay');
      if (notes[state['currentIdea']]) {
        var newText = '<ul>';
        for (elem in notes[state['currentIdea']]) {
          newText += '<li>' + notes[state['currentIdea']][elem] + '</li>';
        }
        newText += '</ul>';
        noteDisplay.innerHTML = newText;
      } else {
        noteDisplay.innerHTML = '';
      }
      noteDisplay.scrollTop = noteDisplay.scrollHeight;
    }

    // change button
    // update everything else in UI (title, voting)
  } else if (statePhase === 2) {
    var button = document.getElementById('phaseButton');
    button.value = 'Done';
    var title = document.getElementById('title');
    setText(title, 'Phase 3: Vote on your ideas!');
    var countButton = document.getElementById('countButton');
    var inputField = document.getElementById('inputField');
    var currentIdea = document.getElementById('currentIdea');
    setText(currentIdea, 'Remaining Votes: ' + (voteCap - userTotalVotes));
    currentIdea.style.border = "1px solid black";
    if (countButton && inputField) {
      countButton.parentNode.removeChild(countButton);
      inputField.parentNode.removeChild(inputField);
    }
    var sortButton = document.getElementById('sortButton');
    if (sortButton) {
      sortButton.parentNode.removeChild(sortButton);
    }
    var topBar = document.getElementById('topBar');
    topBar.style.backgroundColor = "#FFCAE1";

    var sideBarDiv = document.getElementById('categoryAndNotes');
    sideBarDiv.style.visibility = 'hidden';
    // you're done... final report
  } else if (statePhase === 3){
    var topBar = document.getElementById('topBar');
    topBar.style.backgroundColor = "#E1CAFF";
    var button = document.getElementById('phaseButton');
    button.parentNode.removeChild(button);
    var title = document.getElementById('title');
    setText(title, 'Done! Your top voted ideas:');
    console.log(countElement.innerHTML);
    setText(countElement, '');
    var currentIdea = document.getElementById('currentIdea');
    setText(currentIdea, '');
    currentIdea.style.border = "0px solid black";

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

      setText(countElement, internalValue);
      console.log(countElement.innerHTML);
    }

    //hightlight ideas with most votes / give report
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
