
/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.
    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
        http://aws.amazon.com/apache2.0/
    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * This simple sample has no external dependencies or session management, and shows the most basic
 * example of how to create a Lambda function for handling Alexa Skill requests.
 *
 * Examples:
 * One-shot model:
 *  User: "Alexa, Practice Speech begin/start/please"
 *  Alexa: "Please repeat after me: ..."
 */

/**
 * App ID for the skill
 */
var APP_ID = undefined; //OPTIONAL: replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";
var currentPhrase = "";
var wrongWordQueue = [];
var currentState = 0;

var BEGIN = 0;
var REPEAT = 1;
var WORD_REPEAT = 2;
var COMPLETE = 3;
/**
 * Array containing space PHRASES.
 */
var PHRASES = [
    "Dominic Abhi and Cathal are the greatest alexa developers to ever live.",
    "My mom drove me to school fifteen minutes late on Tuesday.",
    "The girl wore her hair in two braids tied with two blue bows.",
    "The mouse was so hungry he ran across the kitchen floor without even looking for humans.",
    "The tape got stuck on my lips so I couldn't talk anymore.",
    "The door slammed down on my hand and I screamed like a little baby.",
    "My shoes are blue with yellow stripes and green stars on the front.",
    "The mailbox was bent and broken and looked like someone had knocked it over on purpose.",
    "I was so thirsty I couldn't wait to get a drink of water.",
    "I found a gold coin on the playground after school today.",
    "The chocolate chip cookies smelled so good that I ate one without asking.",
    "My bandaid wasn't sticky any more so it fell off on the way to school."
];

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

/**
 * SpeechPractice is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var Phrase = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
Phrase.prototype = Object.create(AlexaSkill.prototype);
Phrase.prototype.constructor = Phrase;

Phrase.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    //console.log("onSessionStarted requestId: " + sessionStartedRequest.requestId + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
    currentPhrase = "";
    currentState = 0;
    wrongWordQueue = [];
};

Phrase.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    //console.log("onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    handleSpeechTherapyRequest(launchRequest, session, response);
};

/**
 * Overridden to show that a subclass can override this function to teardown session state.
 */
Phrase.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    //console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
    currentPhrase = "";
    currentState = 0;
    wrongWordQueue = [];
};

Phrase.prototype.intentHandlers = {
    "SpeechTherapyIntent": function (intent, session, response) {
        handleSpeechTherapyRequest(intent, session, response);
    },

    "VerifySpeechIntent": function(intent, session, response) {
        handleVerifySpeechRequest(intent, session, response);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        response.ask("You can say begin speech therapy, or, you can say exit... What can I help you with?", "What can I help you with?");
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    }
};


function handleSpeechTherapyRequest(intent, session, response) {
        var phraseIndex = Math.floor(Math.random() * PHRASES.length);
        var randomPhrase = PHRASES[phraseIndex];
    
        currentPhrase = randomPhrase.toLowerCase().trim();
    
        // Create speech output
        speechOutput = currentState + "R Please repeat after me: " + randomPhrase;
        currentState = REPEAT;

        response.ask(speechOutput, speechOutput);
}

function handleVerifySpeechRequest(intent, session, response) {
    var speechOutput = "";

    var detectedSpeech = intent.slots.speech.value;
    detectedSpeech = detectedSpeech.toLowerCase().trim();


    if (currentState == REPEAT) {
        if (detectedSpeech.localeCompare(currentPhrase)===0){
            currentState = COMPLETE;
            wrongWordQueue = [];
            speechOutput = "Well done! Say Another One to try a new sentance or quit to quit Speech Therapy.";
            response.ask(speechOutput, speechOutput);
        } else {
            currentState = WORD_REPEAT;

            var ans = currentPhrase.split(" ");
            var inp = detectedSpeech.split(" ");

            //Some kind of machine learnign?
            if ((ans.length - inp.length) !== 0) {
                currentState = REPEAT;
                speechOutput = "Could you please repeat after me: " + currentPhrase;
            } else {
                currentState = WORD_REPEAT;
                for (i=0; i<ans.length; i++) {
                    //two iterators? 
                    if (ans[i].localeCompare(inp[i]) !== 0) {
                        var ww = "";
                        if (i-1 >= 0)
                            ww += ans[i-1];
                        ww += " " + ans[i] + " ";
                        if (i+1 < ans.length)
                            ww+= ans[i+1];
                            
                        wrongWordQueue.push(ww.trim());
                    }
                }
                
                if (wrongWordQueue.length === 0) {
                    currentState = COMPLETE;
                    wrongWordQueue = [];
                    speechOutput = "Well done! Say Another One to try a new sentance or quit to quit Speech Therapy.";
                    response.ask(speechOutput, speechOutput);
                } else {
                    speechOutput = "RP Please repeat after me: " + wrongWordQueue[0];
                }
            }
            response.ask(speechOutput, speechOutput);
        }
    } else if (currentState == WORD_REPEAT) {
        if (detectedSpeech.localeCompare(wrongWordQueue[0]) === 0){
            wrongWordQueue.shift();

            if (wrongWordQueue.length === 0) {
                currentState = REPEAT;
                speechOutput = "WR 1 please repeat after me: " + currentPhrase;
            }
            else 
                speechOutput = "WR 2 Please repeat after me: " + wrongWordQueue[0];
        } else {
            speechOutput = "WR 3 Please repeat after me: " + wrongWordQueue[0];
        }
        response.ask(speechOutput, speechOutput);
    } else if (currentState == COMPLETE) {
        currentPhrase = "";
        if (detectedSpeech == "another one") {
            currentState = BEGIN;
            currentPhrase = "";
            wrongWordQueue = [];
            handleSpeechTherapyRequest(intent, session, response);
        } else {
            speechOutput = "I didn't understand you. Say Another One to try a new sentance or quit to quit Speech Therapy.";
            response.ask(speechOutput, speechOutput);            
        }
    } else {
        speechOutput = "I didn't understand you. Say Another One to try a new sentance or quit to quit Speech Therapy.";
        response.ask(speechOutput, speechOutput);                    
    }
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the PracticeSpeech skill.
    var phrase = new Phrase();
    phrase.execute(event, context);
};