
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
     "My mom drove me to school fifteen minutes late on Tuesday",
     "The girl wore her hair in two braids tied with two blue bows",
     "The mouse was so hungry he ran across the kitchen floor without even looking for humans",
     "The tape got stuck on my lips so I couldn't talk anymore",
     "The door slammed down on my hand and I screamed like a little baby",
     "My shoes are blue with yellow stripes and green stars on the front",
     "The mailbox was bent and broken and looked like someone had knocked it over on purpose",
     "I was so thirsty I couldn't wait to get a drink of water",
     "I found a gold coin on the playground after school today",
     "The chocolate chip cookies smelled so good that I ate one without asking",
     "My bandaid wasn't sticky any more so it fell off on the way to school",
     "He had a sore throat so I gave him my bottle of water and told him to keep it",
     "The church was white and brown and looked very old",
     "I was so scared to go to a monster movie but my dad said he would sit with me so we went last night",
     "Your mom is so nice she gave me a ride home today",
     "I fell in the mud when I was walking home from school today",
     "This dinner is so delicious I can't stop eating",
     "The school principal was so mean that all the children were scared of him",
     "I went to the dentist the other day and he let me pick a prize out of the prize box",
     "The box was small and wrapped in paper with tiny silver and red glitter dots",
     "My dad is so funny that he told us jokes all night long and we never fell asleep",
     "The camping trip was so awesome that I didn't want to come home",
     "Are you going to have a blue birthday cake for your next birthday",
     "How did you know that I was going to have a peanut butter sandwich for lunch?",
     "That boy is so mean that he doesn't care if a door slams in your face or if he cuts in line",
     "The moms and dads all sat around drinking coffee and eating donuts",
     "My mom made a milkshake with frozen bananas and chocolate sauce",
     "My pen broke and leaked blue ink all over my new dress",
     "I got my haircut today and they did it way too short",
     "My pet turtle Jim got out of his cage and I could not find him anywhere",
     "The dog was so tired he fell asleep on the way to his doghouse",
     "My mom drives a green jeep and my dad drives a black truck",
     "Your sister is my best friend because she always shares her treats with me",
     "My pet Roger is white and fluffy and he loves to eat carrots",
     "Your neighbor is annoying because he cut down my trees",
     "The tape was so sticky it got stuck to my fingers and wouldn't come off",
     "My glass of water broke when it fell off the table",
     "The clock was ticking and kept me awake all night",
     "My dad told me that I was his favorite person in the whole wide world",
     "The chickens were running around and pecking worms out of the ground",
     "The game looked fun but all the pieces were missing",
     "I got my finger stuck in the door when I slammed it",
     "I was so mad that I yelled at him at the top of my lungs",
     "My favorite dress is ruined because I spilled ketchup on it last night",
     "My home is bright pink and has yellow flowers growing all around it",
     "My buddy is going to pick me up after school and give me a ride to work",
     "I don't know where my list of friends went to invite them to my birthday party",
     "The gum was stuck under the desk and I couldn't get it off",
     "The baby was so cute but she was crying so loud I had to plug my ears",
     "The flowers smelled beautiful and made the room so happy",
     "My sister likes to eat cheese on her peanut butter sandwich and pickles on her ice cream",
     "The alligator's teeth were so scary that I ran back to the car as fast as I could",
     "Her dress was blue with white and pink polka dots, but it was ripped down the back",
     "The puzzle took me so long to put together that I threw it in the garbage",
     "He was driving me crazy so I told a joke and made him laugh",
     "I started walking home and my feet got so tired I had to stop and take breaks",
     "I piled my books in my arms and then they fell all over the floor",
     "The dog chased the cat around the block 4 times",
     "My lunch box had a peanut butter sandwich crackers juice and a cheese stick in it",
     "I accidentally left my money in my pants pocket and it got ruined in the washer"
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
        var speechOutput = "Goodbye!";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Goodbye!";
        response.tell(speechOutput);
    }
};


function handleSpeechTherapyRequest(intent, session, response) {
        var phraseIndex = Math.floor(Math.random() * PHRASES.length);
        var randomPhrase = PHRASES[phraseIndex];

        currentPhrase = randomPhrase.toLowerCase().trim();

        // Create speech output
        currentState = BEGIN;
        speechOutput = currentState + "Please repeat after me: " + randomPhrase;
        currentState = REPEAT;

        response.ask(speechOutput, speechOutput);
}

function handleVerifySpeechRequest(intent, session, response) {
    var speechOutput = "";

    var detectedSpeech = intent.slots.speech.value;
    detectedSpeech = detectedSpeech.toLowerCase().trim();


    //PHRASE REPEAT
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
                } else if(wrongWordQueue.length === 1) {
                   speechOutput = "Almost! But it looks like you made one small mistake! Let's practice! Please repeat after me: " + wrongWordQueue[0];
                }else{
                    speechOutput = "Looks like you made a mistake on " + wrongWordQueue.length + "words. Don't worry, let's practice! Okay, repeat after me: " + wrongWordQueue[0];
                }
            }
            response.ask(speechOutput, speechOutput);
        }

    // WORD REPEAT
    } else if (currentState == WORD_REPEAT) {
        //if correct
        if (detectedSpeech.localeCompare(wrongWordQueue[0]) === 0){
            wrongWordQueue.shift();

            if (wrongWordQueue.length === 0) {
                currentState = REPEAT;
                speechOutput = "Great stuff! Let's try the entire phrase again. Repeat after me: " + currentPhrase;
            } else {
                currentState = WORD_REPEAT;
                speechOutput = "Good job! Ok, next one! Repeat after me: " + wrongWordQueue[0];
            }
        } else {
            currentState = WORD_REPEAT;
            speechOutput = "Not quite! Try again! Please repeat after me: " + wrongWordQueue[0];
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
