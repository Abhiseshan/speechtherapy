
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

/**
 * Array containing space PHRASES.
 */
var PHRASES = [
    "Dominic, Abhi and Cathal are the greatest alexa developers to ever live.",
    "My mom drove me to school fifteen minutes late on Tuesday.",
    "The girl wore her hair in two braids, tied with two blue bows.",
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
};

Phrase.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    //console.log("onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    handleSpeechTherapyRequest(response);
};

/**
 * Overridden to show that a subclass can override this function to teardown session state.
 */
Phrase.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    //console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

Phrase.prototype.intentHandlers = {
    "SpeechTherapyIntent": function (intent, session, response) {
        handleSpeechTherapyRequest(response);
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

/**
 * Gets a random new fact from the list and returns to the user.
 */
function handleSpeechTherapyRequest(response) {
    // Get a random phrase from the PHRASES list
    var phraseIndex = Math.floor(Math.random() * PHRASES.length);
    var randomPhrase = PHRASES[phraseIndex];

    currentPhrase = randomPhrase;

    // Create speech output
    var speechOutput = "Please repeat after me: " + randomPhrase;
    response.ask(speechOutput, speechOutput);
}

function handleVerifySpeechRequest(intent, session, response) {
    var detectedSpeech = intent.slots.speech.value;

    if (detectedSpeech == currentPhrase){
        speechOutput = "Well done!";
        cardTitle = "Card Title";
        response.tellWithCard(speechOutput, cardTitle, speechOutput);
    } else {
        speechOutput = "I heard " + detectedSpeech;
        cardTitle = "Card Title";
        response.tellWithCard(speechOutput, cardTitle, speechOutput);
    }
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the PracticeSpeech skill.
    var phrase = new Phrase();
    phrase.execute(event, context);
};