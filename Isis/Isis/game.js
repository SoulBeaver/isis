window.onload = function () {
    var test = new tsUnit.Test(Isis.Tests);
    // Use the built in results display
    test.showResults(document.getElementById("results"), test.run());
    var game = new Isis.Game();
};
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var tsUnit;
(function (tsUnit) {
    var Test = (function () {
        function Test() {
            var testModules = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                testModules[_i - 0] = arguments[_i];
            }
            this.tests = [];
            this.reservedMethodNameContainer = new TestClass();
            this.createTestLimiter();
            for (var i = 0; i < testModules.length; i++) {
                var testModule = testModules[i];
                for (var testClass in testModule) {
                    this.addTestClass(new testModule[testClass](), testClass);
                }
            }
        }
        Test.prototype.addTestClass = function (testClass, name) {
            if (name === void 0) { name = 'Tests'; }
            this.tests.push(new TestDefintion(testClass, name));
        };
        Test.prototype.run = function (testRunLimiter) {
            if (testRunLimiter === void 0) { testRunLimiter = null; }
            var parameters = null;
            var testContext = new TestContext();
            var testResult = new TestResult();
            if (testRunLimiter == null) {
                testRunLimiter = this.testRunLimiter;
            }
            for (var i = 0; i < this.tests.length; ++i) {
                var testClass = this.tests[i].testClass;
                var dynamicTestClass = testClass;
                var testsGroupName = this.tests[i].name;
                if (testRunLimiter && !testRunLimiter.isTestsGroupActive(testsGroupName)) {
                    continue;
                }
                for (var unitTestName in testClass) {
                    if (this.isReservedFunctionName(unitTestName) || (typeof dynamicTestClass[unitTestName] !== 'function') || (testRunLimiter && !testRunLimiter.isTestActive(unitTestName))) {
                        continue;
                    }
                    if (typeof dynamicTestClass[unitTestName].parameters !== 'undefined') {
                        parameters = dynamicTestClass[unitTestName].parameters;
                        for (var parameterIndex = 0; parameterIndex < parameters.length; parameterIndex++) {
                            if (testRunLimiter && !testRunLimiter.isParametersSetActive(parameterIndex)) {
                                continue;
                            }
                            this.runSingleTest(testResult, testClass, unitTestName, testsGroupName, parameters, parameterIndex);
                        }
                    }
                    else {
                        this.runSingleTest(testResult, testClass, unitTestName, testsGroupName);
                    }
                }
            }
            return testResult;
        };
        Test.prototype.showResults = function (target, result) {
            var template = '<article>' + '<h1>' + this.getTestResult(result) + '</h1>' + '<p>' + this.getTestSummary(result) + '</p>' + this.testRunLimiter.getLimitCleaner() + '<section id="tsFail">' + '<h2>Errors</h2>' + '<ul class="bad">' + this.getTestResultList(result.errors) + '</ul>' + '</section>' + '<section id="tsOkay">' + '<h2>Passing Tests</h2>' + '<ul class="good">' + this.getTestResultList(result.passes) + '</ul>' + '</section>' + '</article>' + this.testRunLimiter.getLimitCleaner();
            target.innerHTML = template;
        };
        Test.prototype.getTapResults = function (result) {
            var newLine = '\r\n';
            var template = '1..' + (result.passes.length + result.errors.length).toString() + newLine;
            for (var i = 0; i < result.errors.length; i++) {
                template += 'not ok ' + result.errors[i].message + ' ' + result.errors[i].testName + newLine;
            }
            for (var i = 0; i < result.passes.length; i++) {
                template += 'ok ' + result.passes[i].testName + newLine;
            }
            return template;
        };
        Test.prototype.createTestLimiter = function () {
            try {
                if (typeof window !== 'undefined') {
                    this.testRunLimiter = new TestRunLimiter();
                }
            }
            catch (ex) {
            }
        };
        Test.prototype.isReservedFunctionName = function (functionName) {
            for (var prop in this.reservedMethodNameContainer) {
                if (prop === functionName) {
                    return true;
                }
            }
            return false;
        };
        Test.prototype.runSingleTest = function (testResult, testClass, unitTestName, testsGroupName, parameters, parameterSetIndex) {
            if (parameters === void 0) { parameters = null; }
            if (parameterSetIndex === void 0) { parameterSetIndex = null; }
            if (typeof testClass['setUp'] === 'function') {
                testClass['setUp']();
            }
            try {
                var dynamicTestClass = testClass;
                var args = (parameterSetIndex !== null) ? parameters[parameterSetIndex] : null;
                dynamicTestClass[unitTestName].apply(testClass, args);
                testResult.passes.push(new TestDescription(testsGroupName, unitTestName, parameterSetIndex, 'OK'));
            }
            catch (err) {
                testResult.errors.push(new TestDescription(testsGroupName, unitTestName, parameterSetIndex, err.toString()));
            }
            if (typeof testClass['tearDown'] === 'function') {
                testClass['tearDown']();
            }
        };
        Test.prototype.getTestResult = function (result) {
            return result.errors.length === 0 ? 'Test Passed' : 'Test Failed';
        };
        Test.prototype.getTestSummary = function (result) {
            return 'Total tests: <span id="tsUnitTotalCout">' + (result.passes.length + result.errors.length).toString() + '</span>. ' + 'Passed tests: <span id="tsUnitPassCount" class="good">' + result.passes.length + '</span>. ' + 'Failed tests: <span id="tsUnitFailCount" class="bad">' + result.errors.length + '</span>.';
        };
        Test.prototype.getTestResultList = function (testResults) {
            var list = '';
            var group = '';
            var isFirst = true;
            for (var i = 0; i < testResults.length; ++i) {
                var result = testResults[i];
                if (result.testName !== group) {
                    group = result.testName;
                    if (isFirst) {
                        isFirst = false;
                    }
                    else {
                        list += '</li></ul>';
                    }
                    list += '<li>' + this.testRunLimiter.getLimiterForGroup(group) + result.testName + '<ul>';
                }
                var resultClass = (result.message === 'OK') ? 'success' : 'error';
                var functionLabal = result.funcName + ((result.parameterSetNumber === null) ? '()' : '(' + this.testRunLimiter.getLimiterForTest(group, result.funcName, result.parameterSetNumber) + ' paramater set: ' + result.parameterSetNumber + ')');
                list += '<li class="' + resultClass + '">' + this.testRunLimiter.getLimiterForTest(group, result.funcName) + functionLabal + ': ' + this.encodeHtmlEntities(result.message) + '</li>';
            }
            return list + '</ul>';
        };
        Test.prototype.encodeHtmlEntities = function (input) {
            return input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        };
        return Test;
    })();
    tsUnit.Test = Test;
    var TestRunLimiterRunAll = (function () {
        function TestRunLimiterRunAll() {
        }
        TestRunLimiterRunAll.prototype.isTestsGroupActive = function (groupName) {
            return true;
        };
        TestRunLimiterRunAll.prototype.isTestActive = function (testName) {
            return true;
        };
        TestRunLimiterRunAll.prototype.isParametersSetActive = function (paramatersSetNumber) {
            return true;
        };
        return TestRunLimiterRunAll;
    })();
    var TestRunLimiter = (function () {
        function TestRunLimiter() {
            this.groupName = null;
            this.testName = null;
            this.parameterSet = null;
            this.setRefreshOnLinksWithHash();
            this.translateStringIntoTestsLimit(window.location.hash);
        }
        TestRunLimiter.prototype.isTestsGroupActive = function (groupName) {
            if (this.groupName === null) {
                return true;
            }
            return this.groupName === groupName;
        };
        TestRunLimiter.prototype.isTestActive = function (testName) {
            if (this.testName === null) {
                return true;
            }
            return this.testName === testName;
        };
        TestRunLimiter.prototype.isParametersSetActive = function (paramatersSet) {
            if (this.parameterSet === null) {
                return true;
            }
            return this.parameterSet === paramatersSet;
        };
        TestRunLimiter.prototype.getLimiterForTest = function (groupName, testName, parameterSet) {
            if (parameterSet === void 0) { parameterSet = null; }
            if (parameterSet !== null) {
                testName += '(' + parameterSet + ')';
            }
            return '&nbsp;<a href="#' + groupName + '/' + testName + '\" class="ascii">&#9658;</a>&nbsp;';
        };
        TestRunLimiter.prototype.getLimiterForGroup = function (groupName) {
            return '&nbsp;<a href="#' + groupName + '" class="ascii">&#9658;</a>&nbsp;';
        };
        TestRunLimiter.prototype.getLimitCleaner = function () {
            return '<p><a href="#">Run all tests <span class="ascii">&#9658;</span></a></p>';
        };
        TestRunLimiter.prototype.setRefreshOnLinksWithHash = function () {
            var previousHandler = window.onhashchange;
            window.onhashchange = function (ev) {
                window.location.reload();
                if (typeof previousHandler === 'function') {
                    previousHandler(ev);
                }
            };
        };
        TestRunLimiter.prototype.translateStringIntoTestsLimit = function (value) {
            var regex = /^#([_a-zA-Z0-9]+)((\/([_a-zA-Z0-9]+))(\(([0-9]+)\))?)?$/;
            var result = regex.exec(value);
            if (result === null) {
                return;
            }
            if (result.length > 1 && !!result[1]) {
                this.groupName = result[1];
            }
            if (result.length > 4 && !!result[4]) {
                this.testName = result[4];
            }
            if (result.length > 6 && !!result[6]) {
                this.parameterSet = parseInt(result[6], 10);
            }
        };
        return TestRunLimiter;
    })();
    var TestContext = (function () {
        function TestContext() {
        }
        TestContext.prototype.setUp = function () {
        };
        TestContext.prototype.tearDown = function () {
        };
        TestContext.prototype.areIdentical = function (expected, actual, message) {
            if (message === void 0) { message = ''; }
            if (expected !== actual) {
                throw this.getError('areIdentical failed when given ' + this.printVariable(expected) + ' and ' + this.printVariable(actual), message);
            }
        };
        TestContext.prototype.areNotIdentical = function (expected, actual, message) {
            if (message === void 0) { message = ''; }
            if (expected === actual) {
                throw this.getError('areNotIdentical failed when given ' + this.printVariable(expected) + ' and ' + this.printVariable(actual), message);
            }
        };
        TestContext.prototype.areCollectionsIdentical = function (expected, actual, message) {
            var _this = this;
            if (message === void 0) { message = ''; }
            function resultToString(result) {
                var msg = '';
                while (result.length > 0) {
                    msg = '[' + result.pop() + ']' + msg;
                }
                return msg;
            }
            var compareArray = function (expected, actual, result) {
                var indexString = '';
                if (expected === null) {
                    if (actual !== null) {
                        indexString = resultToString(result);
                        throw _this.getError('areCollectionsIdentical failed when array a' + indexString + ' is null and b' + indexString + ' is not null', message);
                    }
                    return; // correct: both are nulls
                }
                else if (actual === null) {
                    indexString = resultToString(result);
                    throw _this.getError('areCollectionsIdentical failed when array a' + indexString + ' is not null and b' + indexString + ' is null', message);
                }
                if (expected.length !== actual.length) {
                    indexString = resultToString(result);
                    throw _this.getError('areCollectionsIdentical failed when length of array a' + indexString + ' (length: ' + expected.length + ') is different of length of array b' + indexString + ' (length: ' + actual.length + ')', message);
                }
                for (var i = 0; i < expected.length; i++) {
                    if ((expected[i] instanceof Array) && (actual[i] instanceof Array)) {
                        result.push(i);
                        compareArray(expected[i], actual[i], result);
                        result.pop();
                    }
                    else if (expected[i] !== actual[i]) {
                        result.push(i);
                        indexString = resultToString(result);
                        throw _this.getError('areCollectionsIdentical failed when element a' + indexString + ' (' + _this.printVariable(expected[i]) + ') is different than element b' + indexString + ' (' + _this.printVariable(actual[i]) + ')', message);
                    }
                }
                return;
            };
            compareArray(expected, actual, []);
        };
        TestContext.prototype.areCollectionsNotIdentical = function (expected, actual, message) {
            if (message === void 0) { message = ''; }
            try {
                this.areCollectionsIdentical(expected, actual);
            }
            catch (ex) {
                return;
            }
            throw this.getError('areCollectionsNotIdentical failed when both collections are identical', message);
        };
        TestContext.prototype.isTrue = function (actual, message) {
            if (message === void 0) { message = ''; }
            if (!actual) {
                throw this.getError('isTrue failed when given ' + this.printVariable(actual), message);
            }
        };
        TestContext.prototype.isFalse = function (actual, message) {
            if (message === void 0) { message = ''; }
            if (actual) {
                throw this.getError('isFalse failed when given ' + this.printVariable(actual), message);
            }
        };
        TestContext.prototype.isTruthy = function (actual, message) {
            if (message === void 0) { message = ''; }
            if (!actual) {
                throw this.getError('isTrue failed when given ' + this.printVariable(actual), message);
            }
        };
        TestContext.prototype.isFalsey = function (actual, message) {
            if (message === void 0) { message = ''; }
            if (actual) {
                throw this.getError('isFalse failed when given ' + this.printVariable(actual), message);
            }
        };
        TestContext.prototype.throws = function (a, message, errorString) {
            if (message === void 0) { message = ''; }
            if (errorString === void 0) { errorString = ''; }
            var actual;
            if (a.fn) {
                actual = a.fn;
                message = a.message;
                errorString = a.exceptionString;
            }
            var isThrown = false;
            try {
                actual();
            }
            catch (ex) {
                if (!errorString || ex.message === errorString) {
                    isThrown = true;
                }
                if (errorString && ex.message !== errorString) {
                    throw this.getError('different error string than supplied');
                }
            }
            if (!isThrown) {
                throw this.getError('did not throw an error', message || '');
            }
        };
        TestContext.prototype.executesWithin = function (actual, timeLimit, message) {
            if (message === void 0) { message = null; }
            function getTime() {
                return window.performance.now();
            }
            function timeToString(value) {
                return Math.round(value * 100) / 100;
            }
            var startOfExecution = getTime();
            try {
                actual();
            }
            catch (ex) {
                throw this.getError('isExecuteTimeLessThanLimit fails when given code throws an exception: "' + ex + '"', message);
            }
            var executingTime = getTime() - startOfExecution;
            if (executingTime > timeLimit) {
                throw this.getError('isExecuteTimeLessThanLimit fails when execution time of given code (' + timeToString(executingTime) + ' ms) ' + 'exceed the given limit(' + timeToString(timeLimit) + ' ms)', message);
            }
        };
        TestContext.prototype.fail = function (message) {
            if (message === void 0) { message = ''; }
            throw this.getError('fail', message);
        };
        TestContext.prototype.getError = function (resultMessage, message) {
            if (message === void 0) { message = ''; }
            if (message) {
                return new Error(resultMessage + '. ' + message);
            }
            return new Error(resultMessage);
        };
        TestContext.getNameOfClass = function (inputClass) {
            // see: https://www.stevefenton.co.uk/Content/Blog/Date/201304/Blog/Obtaining-A-Class-Name-At-Runtime-In-TypeScript/
            var funcNameRegex = /function (.{1,})\(/;
            var results = (funcNameRegex).exec(inputClass.constructor.toString());
            return (results && results.length > 1) ? results[1] : '';
        };
        TestContext.prototype.printVariable = function (variable) {
            if (variable === null) {
                return '"null"';
            }
            if (typeof variable === 'object') {
                return '{object: ' + TestContext.getNameOfClass(variable) + '}';
            }
            return '{' + (typeof variable) + '} "' + variable + '"';
        };
        return TestContext;
    })();
    tsUnit.TestContext = TestContext;
    var TestClass = (function (_super) {
        __extends(TestClass, _super);
        function TestClass() {
            _super.apply(this, arguments);
        }
        TestClass.prototype.parameterizeUnitTest = function (method, parametersArray) {
            method.parameters = parametersArray;
        };
        return TestClass;
    })(TestContext);
    tsUnit.TestClass = TestClass;
    var FakeFactory = (function () {
        function FakeFactory() {
        }
        FakeFactory.getFake = function (obj) {
            var implementations = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                implementations[_i - 1] = arguments[_i];
            }
            var fakeType = function () {
            };
            this.populateFakeType(fakeType, obj);
            var fake = new fakeType();
            for (var member in fake) {
                if (typeof fake[member] === 'function') {
                    fake[member] = function () {
                        console.log('Default fake called.');
                    };
                }
            }
            var memberNameIndex = 0;
            var memberValueIndex = 1;
            for (var i = 0; i < implementations.length; i++) {
                var impl = implementations[i];
                fake[impl[memberNameIndex]] = impl[memberValueIndex];
            }
            return fake;
        };
        FakeFactory.populateFakeType = function (fake, toCopy) {
            for (var property in toCopy) {
                if (toCopy.hasOwnProperty(property)) {
                    fake[property] = toCopy[property];
                }
            }
            var __ = function () {
                this.constructor = fake;
            };
            __.prototype = toCopy.prototype;
            fake.prototype = new __();
        };
        return FakeFactory;
    })();
    tsUnit.FakeFactory = FakeFactory;
    var TestDefintion = (function () {
        function TestDefintion(testClass, name) {
            this.testClass = testClass;
            this.name = name;
        }
        return TestDefintion;
    })();
    var TestDescription = (function () {
        function TestDescription(testName, funcName, parameterSetNumber, message) {
            this.testName = testName;
            this.funcName = funcName;
            this.parameterSetNumber = parameterSetNumber;
            this.message = message;
        }
        return TestDescription;
    })();
    tsUnit.TestDescription = TestDescription;
    var TestResult = (function () {
        function TestResult() {
            this.passes = [];
            this.errors = [];
        }
        return TestResult;
    })();
    tsUnit.TestResult = TestResult;
})(tsUnit || (tsUnit = {}));
var Isis;
(function (Isis) {
    function fileExists(path) {
        var request = new XMLHttpRequest();
        request.open("HEAD", path, false);
        request.send();
        return request.status != 404;
    }
    Isis.fileExists = fileExists;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    /**
     * Entry into the game. Define any states necessary, then start the loading process.
     */
    var Game = (function (_super) {
        __extends(Game, _super);
        function Game() {
            _super.call(this, 640, 480, Phaser.AUTO, "content", null);
            this.state.add(Isis.State.Boot, Isis.Boot, false);
            this.state.add(Isis.State.Preloader, Isis.Preloader, false);
            this.state.add(Isis.State.MainMenu, Isis.MainMenu, false);
            this.state.add(Isis.State.InGame, Isis.InGame, false);
            this.state.start(Isis.State.Boot);
        }
        return Game;
    })(Phaser.Game);
    Isis.Game = Game;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    function toKeyCode(keyString) {
        return Phaser.Keyboard[keyString];
    }
    Isis.toKeyCode = toKeyCode;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    var Player = (function (_super) {
        __extends(Player, _super);
        function Player(game, coordinates) {
            _super.call(this, game, coordinates.x, coordinates.y, "creature_atlas");
            this._acceleration = 150;
            this.addAnimations();
            this.addPhysics();
            this.game.add.existing(this);
        }
        Player.prototype.addAnimations = function () {
            this.animations.add("idle", ["blue_knight_1.png", "blue_knight_2.png"], 2, true);
            this.animations.play("idle");
        };
        Player.prototype.addPhysics = function () {
            this.game.physics.enable(this, Phaser.Physics.ARCADE);
        };
        return Player;
    })(Phaser.Sprite);
    Isis.Player = Player;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    /**
     * Boot configures the game (dimensions, scale, platform-dependent code, etc)
     * and loads the loading bar for the upcoming asset loading.
     */
    var Boot = (function (_super) {
        __extends(Boot, _super);
        function Boot() {
            _super.apply(this, arguments);
        }
        Boot.prototype.preload = function () {
            this.load.image("preloadBar", "assets/preloadBar.png");
            this.load.json("settings", "assets/settings.json");
        };
        Boot.prototype.create = function () {
            this.configureGame();
            this.game.state.start(Isis.State.Preloader, false, true);
        };
        Boot.prototype.configureGame = function () {
            this.game.physics.startSystem(Phaser.Physics.ARCADE);
            //scaling options
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.scale.setShowAll();
            this.scale.refresh();
            //have the game centered horizontally
            this.scale.pageAlignHorizontally = true;
            this.scale.pageAlignVertically = true;
        };
        return Boot;
    })(Phaser.State);
    Isis.Boot = Boot;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    /**
     * A mini-controller that is part of a proper Phaser.State. Can still be updated
     * like a Phaser.State and performs whatever logic necessary.
     */
    var InGameSubState = (function () {
        function InGameSubState(game, view, map, player) {
            this.onSwitchState = new Phaser.Signal();
            this.game = game;
            this.view = view;
            this.map = map;
            this.player = player;
        }
        InGameSubState.prototype.initialize = function (map, player) {
            if (map)
                this.map = map;
            if (player)
                this.player = player;
        };
        InGameSubState.prototype.update = function () {
        };
        InGameSubState.prototype.finalize = function () {
        };
        return InGameSubState;
    })();
    Isis.InGameSubState = InGameSubState;
})(Isis || (Isis = {}));
/// <reference path="InGameSubState.ts"/>
var Isis;
(function (Isis) {
    var AnimatingState = (function (_super) {
        __extends(AnimatingState, _super);
        function AnimatingState(game, view, map, player) {
            _super.call(this, game, view, map, player);
        }
        AnimatingState.prototype.initialize = function (map, player) {
            _super.prototype.initialize.call(this, map, player);
            this.view.onTweensFinished.add(this.switchToNextState, this);
            this.view.play();
        };
        AnimatingState.prototype.update = function () {
        };
        AnimatingState.prototype.switchToNextState = function () {
            this.onSwitchState.dispatch([this.nextState]);
        };
        return AnimatingState;
    })(Isis.InGameSubState);
    Isis.AnimatingState = AnimatingState;
})(Isis || (Isis = {}));
/// <reference path="InGameSubState.ts"/>
var Isis;
(function (Isis) {
    var EnemyState = (function (_super) {
        __extends(EnemyState, _super);
        function EnemyState() {
            _super.apply(this, arguments);
        }
        EnemyState.prototype.update = function () {
            this.switchToAnimatingState();
        };
        EnemyState.prototype.switchToAnimatingState = function () {
            this.onSwitchState.dispatch();
        };
        return EnemyState;
    })(Isis.InGameSubState);
    Isis.EnemyState = EnemyState;
})(Isis || (Isis = {}));
/// <reference path="InGameSubState.ts"/>
var Isis;
(function (Isis) {
    /**
     * Controlling class for any player actions made.
     */
    var PlayerState = (function (_super) {
        __extends(PlayerState, _super);
        function PlayerState(game, view, map, player) {
            _super.call(this, game, view, map, player);
            this.onChangeMap = new Phaser.Signal();
            this.actionMap = [];
            this.creaturesToDelete = [];
            this.initializeInputBindings();
        }
        PlayerState.prototype.initializeInputBindings = function () {
            var _this = this;
            var settings = this.game.cache.getJSON("settings");
            // I'd like to keep the keys separate from the actions, so we read from the assets/settings.json to see which key is bound to which
            // action. We can then construct a decoupled associative array for every action. Currently, the player can only move via keyboard
            // but I'm hoping to allow for mouse input as well.
            // Caveat:  the settings.json input MUST be a string value of Phaser.Keyboard.<Key>. Otherwise an exception will be thrown.
            this.actionMap[settings.move_left] = function () { return _this.tryMoveTo(_this.map.toTileCoordinates({ x: _this.player.x - 24, y: _this.player.y })); };
            this.actionMap[settings.move_right] = function () { return _this.tryMoveTo(_this.map.toTileCoordinates({ x: _this.player.x + 24, y: _this.player.y })); };
            this.actionMap[settings.move_up] = function () { return _this.tryMoveTo(_this.map.toTileCoordinates({ x: _this.player.x, y: _this.player.y - 24 })); };
            this.actionMap[settings.move_down] = function () { return _this.tryMoveTo(_this.map.toTileCoordinates({ x: _this.player.x, y: _this.player.y + 24 })); };
        };
        PlayerState.prototype.update = function () {
            var keyboard = this.game.input.keyboard;
            for (var inputCommand in this.actionMap) {
                var keyCode = Isis.toKeyCode(inputCommand);
                if (keyboard.isDown(keyCode)) {
                    this.actionMap[inputCommand]();
                    this.switchToAnimatingState();
                }
            }
        };
        /*
         * A player can do three things when moving:
         *     Move if there is nothing in the way
         *     Attack if a creature is in the way
         *     Activate an object if it is in the way
         *
         * I chose not to ignore the movement if a creature or object is in the way because I find it
         * it intuitive that a "bump" between player and creature should mean attack, or that
         * the player bumping into an object should mean that the user wants to activate it.
         * Creating a special shortcut or method to activate these separate from moving into them
         * seems like too much work and not worth the effort.
         */
        PlayerState.prototype.tryMoveTo = function (destination) {
            if (this.map.wallAt(destination))
                return;
            if (this.map.creatureAt(destination)) {
                this.attack(this.player, this.map.creatureAt(destination));
            }
            else if (this.map.objectAt(destination)) {
                this.activate(this.player, this.map.objectAt(destination));
            }
            else {
                if (this.map.itemAt(destination))
                    this.pickUp(this.player, this.map.itemAt(destination));
                this.move(this.player, destination);
            }
        };
        // For now, attacking a creature will automatically kill it.
        PlayerState.prototype.attack = function (player, creature) {
            this.view.attack(player, creature);
            this.creaturesToDelete.push(creature);
        };
        PlayerState.prototype.activate = function (player, object) {
            if (!object.trigger)
                return;
            var trigger = object.trigger;
            if (trigger.name == "warp")
                this.onChangeMap.dispatch(trigger.properties.map);
        };
        // For now, the item is destroyed. In future versions, the player will have an inventory.
        PlayerState.prototype.pickUp = function (player, item) {
            this.map.removeItem(item);
        };
        PlayerState.prototype.move = function (player, to) {
            this.view.move(this.player, this.map.toWorldCoordinates(to));
        };
        PlayerState.prototype.switchToAnimatingState = function () {
            this.onSwitchState.dispatch();
        };
        PlayerState.prototype.finalize = function () {
            var _this = this;
            this.creaturesToDelete.forEach(function (creature) { return _this.map.removeCreature(creature); }, this);
            this.creaturesToDelete = [];
        };
        return PlayerState;
    })(Isis.InGameSubState);
    Isis.PlayerState = PlayerState;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    /**
     * Controlling class for all in-game logic. Has the ability to call and create popups and switch to different States.
     */
    var InGame = (function (_super) {
        __extends(InGame, _super);
        function InGame() {
            _super.apply(this, arguments);
        }
        InGame.prototype.create = function () {
            this.game.stage.backgroundColor = "#000000";
            this.mapLoader = new Isis.TilemapLoader(this.game);
            this.initializeView();
            this.switchToMap("maze");
            this.currentState = this.playerState;
        };
        InGame.prototype.initializeView = function () {
            this.view = new Isis.GameView(this.game);
        };
        InGame.prototype.initializeMap = function (mapName) {
            this.map = this.mapLoader.load(mapName);
        };
        InGame.prototype.initializePlayer = function () {
            var spawnPlayerTrigger = this.map.getTrigger("spawn_player");
            var spawnWorldCoordinates = this.map.toWorldCoordinates({
                x: spawnPlayerTrigger.properties.spawnX,
                y: spawnPlayerTrigger.properties.spawnY
            });
            this.player = new Isis.Player(this.game, spawnWorldCoordinates);
            this.game.camera.follow(this.player);
        };
        InGame.prototype.initializeSubStates = function () {
            this.playerState = new Isis.PlayerState(this.game, this.view, this.map, this.player);
            this.playerState.onSwitchState.add(this.switchFromPlayerState, this);
            this.playerState.onChangeMap.add(this.initiateMapChange, this);
            this.enemyState = new Isis.EnemyState(this.game, this.view, this.map, this.player);
            this.enemyState.onSwitchState.add(this.switchFromEnemyState, this);
            // We're not adding a onSwitchState because we switch to either Player or EnemyState depending
            // on which state came before. Therefore, we add a callback to the animating state whenever
            // the Player or EnemyState is finished.
            this.animatingState = new Isis.AnimatingState(this.game, this.view, this.map, this.player);
        };
        InGame.prototype.update = function () {
            if (this.currentState)
                this.currentState.update();
        };
        InGame.prototype.switchFromPlayerState = function () {
            this.currentState.finalize();
            this.currentState = this.animatingState;
            this.currentState.onSwitchState.addOnce(this.switchToEnemyState, this);
            this.currentState.initialize();
        };
        InGame.prototype.switchFromEnemyState = function () {
            this.currentState.finalize();
            this.currentState = this.animatingState;
            this.currentState.onSwitchState.addOnce(this.switchToPlayerState, this);
            this.currentState.initialize();
        };
        InGame.prototype.switchToEnemyState = function () {
            this.currentState.finalize();
            this.currentState = this.enemyState;
            this.currentState.initialize();
        };
        InGame.prototype.switchToPlayerState = function () {
            this.currentState.finalize();
            this.currentState = this.playerState;
            this.currentState.initialize();
        };
        InGame.prototype.initiateMapChange = function (mapName) {
            var _this = this;
            this.removeListeners();
            this.currentState.finalize();
            this.currentState = null;
            this.view.fadeOut();
            this.view.onTweensFinished.addOnce(function () { return _this.onMapFadeOutComplete(mapName); }, this);
            this.view.play();
        };
        InGame.prototype.onMapFadeOutComplete = function (mapName) {
            var _this = this;
            this.destroyMap();
            this.switchToMap(mapName);
            this.view.fadeIn();
            this.view.onTweensFinished.addOnce(function () { return _this.currentState = _this.playerState; }, this);
            this.view.play();
        };
        InGame.prototype.destroyMap = function () {
            this.map.destroy();
            this.player.destroy();
        };
        InGame.prototype.switchToMap = function (mapName) {
            this.initializeMap(mapName);
            this.initializePlayer();
            this.initializeSubStates();
        };
        InGame.prototype.removeListeners = function () {
            this.playerState.onSwitchState.removeAll(this);
            this.playerState.onChangeMap.removeAll(this);
            this.enemyState.onSwitchState.removeAll(this);
            this.animatingState.onSwitchState.removeAll(this);
        };
        return InGame;
    })(Phaser.State);
    Isis.InGame = InGame;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    var MainMenu = (function (_super) {
        __extends(MainMenu, _super);
        function MainMenu() {
            _super.apply(this, arguments);
        }
        MainMenu.prototype.create = function () {
            var text = "Start";
            var style = { font: "65px Arial", fill: "#ffffff", align: "center" };
            this.title = this.game.add.text(this.game.world.centerX - 50, this.game.world.centerY - 10, text, style);
            this.input.onDown.addOnce(this.fadeOut, this);
        };
        MainMenu.prototype.fadeOut = function () {
            this.add.tween(this.title).to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true).onComplete.add(this.startGame, this);
        };
        MainMenu.prototype.startGame = function () {
            this.game.state.start(Isis.State.InGame, true, false);
        };
        return MainMenu;
    })(Phaser.State);
    Isis.MainMenu = MainMenu;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    /**
     * Preloader loads all assets required by every state in the game.
     */
    var Preloader = (function (_super) {
        __extends(Preloader, _super);
        function Preloader() {
            _super.apply(this, arguments);
        }
        Preloader.prototype.preload = function () {
            this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, "preloadBar");
            this.preloadBar.anchor.setTo(0.5, 0.5);
            this.startAssetLoad();
        };
        Preloader.prototype.startAssetLoad = function () {
            this.load.json("manifest", "assets/manifest.json").onLoadComplete.add(this.loadManifestEntries, this);
        };
        Preloader.prototype.loadManifestEntries = function () {
            // At the moment, we want to load ALL the data. The game is still small and there is no significant load time.
            // In the future, if it becomes too much to load at once, we can split the loading from the manifest into stages.
            // Until then, load everything.
            //
            // PS: Even if the load becomes significant, I'd rather look at optimization strategies such as shrinking tilesets and whatnot first.
            var manifest = this.game.cache.getJSON("manifest");
            var manualLoader = new Phaser.Loader(this.game);
            for (var key in manifest) {
                console.log("Loading asset pack with key '" + key + "'");
                manualLoader.pack(key, "assets/manifest.json");
                if (Isis.fileExists("assets/tilemaps/maps/" + key + ".json")) {
                    console.log("Loading 'assets/tilemaps/maps/" + key + ".json");
                    manualLoader.json(key + ".json", "assets/tilemaps/maps/" + key + ".json");
                }
                else {
                    console.warn("The file 'assets/tilemaps/maps/" + key + ".json' does not exist!");
                }
            }
            manualLoader.onLoadComplete.add(this.createPreloadBar, this);
            manualLoader.setPreloadSprite(this.preloadBar);
            manualLoader.start();
        };
        Preloader.prototype.createPreloadBar = function () {
            this.add.tween(this.preloadBar).to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true).onComplete.add(this.startMainMenu, this);
        };
        Preloader.prototype.startMainMenu = function () {
            // We're skipping the main menu to ease testing of gameplay- no need to click through the menu.
            this.game.state.start(Isis.State.InGame, true, false);
        };
        return Preloader;
    })(Phaser.State);
    Isis.Preloader = Preloader;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    /**
     * Enumeration class referring to every State- but not sub-state- found in this game.
     */
    // This is not an enum because TypeScript enums do not support string values.
    var State = (function () {
        function State() {
        }
        State.Boot = "Boot";
        State.Preloader = "Preloader";
        State.MainMenu = "MainMenu";
        State.InGame = "InGame";
        return State;
    })();
    Isis.State = State;
})(Isis || (Isis = {}));
/// <reference path="../../../libs/lodash/lodash.d.ts" />
var Isis;
(function (Isis) {
    var GameView = (function () {
        function GameView(game) {
            this.tweensToPlay = [];
            this.onTweensStarted = new Phaser.Signal();
            this.onTweensFinished = new Phaser.Signal();
            this.game = game;
        }
        GameView.prototype.move = function (entity, to) {
            var tween = this.game.add.tween(entity).to(to, 300, Phaser.Easing.Linear.None);
            this.registerTweenDeletion(tween);
            this.tweensToPlay.push(tween);
        };
        GameView.prototype.attack = function (player, creature) {
            var xOffset = player.x - creature.x;
            var yOffset = player.y - creature.y;
            var tween = this.game.add.tween(player).to({
                x: player.x - xOffset,
                y: player.y - yOffset,
                angle: xOffset <= 0 ? 20 : -20
            }, 100, Phaser.Easing.Linear.None).yoyo(true);
            this.registerTweenDeletion(tween);
            this.tweensToPlay.push(tween);
        };
        GameView.prototype.fadeOut = function () {
            var fadeRectangle = this.createFullScreenRectangle(-this.game.world.width, 0);
            var tween = this.game.add.tween(fadeRectangle).to({ x: 0 }, 500, Phaser.Easing.Linear.None);
            tween.onComplete.add(function () { return fadeRectangle.destroy(); });
            this.registerTweenDeletion(tween);
            this.tweensToPlay.push(tween);
        };
        GameView.prototype.fadeIn = function () {
            var fadeRectangle = this.createFullScreenRectangle(0, 0);
            var tween = this.game.add.tween(fadeRectangle).to({ x: this.game.world.width }, 500, Phaser.Easing.Linear.None);
            tween.onComplete.add(function () { return fadeRectangle.destroy(); });
            this.registerTweenDeletion(tween);
            this.tweensToPlay.push(tween);
        };
        GameView.prototype.createFullScreenRectangle = function (x, y) {
            var fadeRectangle = this.game.add.graphics(x, y);
            fadeRectangle.lineStyle(1, 0x000000, 1);
            fadeRectangle.beginFill(0x000000, 1);
            fadeRectangle.drawRect(0, 0, this.game.world.width, this.game.world.height);
            return fadeRectangle;
        };
        GameView.prototype.play = function () {
            _.forEach(this.tweensToPlay, function (tween) { return tween.start(); });
            this.onTweensStarted.dispatch();
            this.dispatchIfNoActiveTweensRemain();
        };
        GameView.prototype.registerTweenDeletion = function (tween) {
            var _this = this;
            tween.onComplete.add(function () {
                _this.tweensToPlay = _.reject(_this.tweensToPlay, tween);
                _this.dispatchIfNoActiveTweensRemain();
            }, this);
        };
        GameView.prototype.dispatchIfNoActiveTweensRemain = function () {
            if (_.isEmpty(this.tweensToPlay))
                this.onTweensFinished.dispatch();
        };
        return GameView;
    })();
    Isis.GameView = GameView;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    var ActivatableObject = (function (_super) {
        __extends(ActivatableObject, _super);
        function ActivatableObject(game, x, y, key, frame) {
            _super.call(this, game, x, y, key, frame);
            game.add.existing(this);
        }
        return ActivatableObject;
    })(Phaser.Sprite);
    Isis.ActivatableObject = ActivatableObject;
})(Isis || (Isis = {}));
/// <reference path="../../libs/lodash/lodash.d.ts" />
var Isis;
(function (Isis) {
    var Tilemap = (function (_super) {
        __extends(Tilemap, _super);
        function Tilemap(json) {
            var _this = this;
            _super.call(this, json.game, json.key);
            // layers is already defined in Phaser.Tilemap, so we use tilemapLayers instead.
            this.tilemapLayers = {};
            // A TileMap can have any number of layers, but
            // we're only concerned about the existence of two.
            // The collidables layer has the information about where
            // a Player or Enemy can move to, and where he cannot.
            this.CollidablesLayer = "Collidables";
            // Triggers are map events, anything from loading
            // an item, enemy, or object, to triggers that are activated
            // when the player moves toward it.
            this.TriggersLayer = "Triggers";
            json.tilesets.forEach(function (tileset) { return _this.addTilesetImage(tileset.name, tileset.key); }, this);
            json.tileLayers.forEach(function (layer) {
                _this.tilemapLayers[layer] = _this.createLayer(layer);
            }, this);
            /*
            this.separateCreaturesFromTilemap();
            this.separateItemsFromTilemap();
            this.separateObjectsFromTilemap();
            */
            this.identifyTriggers();
            this.tilemapLayers[this.CollidablesLayer].resizeWorld();
            this.setCollisionBetween(1, 2, true, this.CollidablesLayer);
        }
        Tilemap.prototype.destroy = function () {
            _.forEach(this.items, function (item) { return item.destroy(); });
            _.forEach(this.interactables, function (object) { return object.destroy(); });
            _.forEach(this.creatures, function (creature) { return creature.destroy(); });
            this.items = [];
            this.interactables = [];
            this.creatures = [];
            this.triggers = [];
            this.layers.forEach(function (layer) { return layer.destroy(); }, this);
            this.layers = [];
            _super.prototype.destroy.call(this);
        };
        /*
        private separateCreaturesFromTilemap() {
            this.creatures = this.extractFrom(this.creatureLayer, (creatureTile) => {
                var creatureSprite = this.game.add.sprite(creatureTile.worldX, creatureTile.worldY, "creature_atlas");
                creatureSprite.animations.add("idle",
                                           [
                                               creatureTile.properties.atlas_name + "_1.png",
                                               creatureTile.properties.atlas_name + "_2.png"
                                           ],
                                           2,
                                           true);
                creatureSprite.animations.play("idle");

                return creatureSprite;
            });
        }

        private separateObjectsFromTilemap() {
            this.interactables = this.extractFrom(this.objectLayer, (objectTile) => {
                var objectSprite = new ActivatableObject(this.game,
                                                                         objectTile.worldX,
                                                                         objectTile.worldY,
                                                                         "object_atlas",
                                                                         objectTile.properties.atlas_name + ".png");

                return objectSprite;
            });
        }

        private separateItemsFromTilemap() {
            var centerItem = (item: Phaser.Sprite) => { item.x += this.tileWidth / 6; item.y += this.tileHeight / 6; }

            this.items = this.extractFrom(this.itemLayer, (itemTile) => {
                var itemSprite = this.game.add.sprite(itemTile.worldX,
                                                                   itemTile.worldY,
                                                                   "item_atlas",
                                                                   itemTile.properties.atlas_name + ".png");
                centerItem(itemSprite);

                return itemSprite;
            });
        }

        private extractFrom<T>(layer: Phaser.TilemapLayer, converter: (tile: Phaser.Tile) => T) {
            return _.filter(layer.getTiles(0, 0, this.widthInPixels, this.heightInPixels), (tile) => tile.properties.atlas_name)
                       .map((tile) => converter(this.removeTile(tile.x, tile.y, layer)));
        }
        */
        Tilemap.prototype.identifyTriggers = function () {
            var _this = this;
            /*
            A typical JSON entry for an object in the object layer (our triggers), looks like this:

                {
                 "height":0,
                 "name":"warp",
                 "properties":
                    {
                     "map":"volcano"
                    },
                 "rotation":0,
                 "type":"object",
                 "visible":true,
                 "width":0,
                 "x":60,
                 "y":12
                }
             */
            var mixedTriggers = _.map(this.objects[this.TriggersLayer], function (json) { return new Isis.Trigger(json); });
            _.chain(mixedTriggers).filter({ type: "object" }).forEach(function (trigger) {
                var object = _this.objectAt(_this.toTileCoordinates(trigger));
                object.trigger = trigger;
            });
            this.triggers = _.reject(mixedTriggers, { type: "object" });
        };
        Tilemap.prototype.wallAt = function (at) {
            var tile = this.getTile(at.x, at.y, this.CollidablesLayer);
            return tile && tile.index != 0;
        };
        Tilemap.prototype.itemAt = function (at) {
            var _this = this;
            return _.find(this.items, function (item) { return _.isEqual(_this.toTileCoordinates(item), at); });
        };
        Tilemap.prototype.objectAt = function (at) {
            var _this = this;
            return _.find(this.interactables, function (object) { return _.isEqual(_this.toTileCoordinates(object), at); });
        };
        Tilemap.prototype.creatureAt = function (at) {
            var _this = this;
            return _.find(this.creatures, function (creature) { return _.isEqual(_this.toTileCoordinates(creature), at); });
        };
        Tilemap.prototype.triggerAt = function (at) {
            var _this = this;
            return _.find(this.triggers, function (trigger) { return _.isEqual(_this.toTileCoordinates(trigger), at); });
        };
        Tilemap.prototype.getTrigger = function (name) {
            return _.find(this.triggers, { name: name });
        };
        Tilemap.prototype.removeItem = function (item) {
            _.remove(this.items, function (candidate) { return _.isEqual(candidate, item); });
            item.destroy();
        };
        Tilemap.prototype.removeCreature = function (creature) {
            _.remove(this.creatures, function (candidate) { return _.isEqual(candidate, creature); });
            creature.destroy();
        };
        Tilemap.prototype.toTileCoordinates = function (worldCoordinates) {
            return {
                x: Math.floor(worldCoordinates.x / this.tileWidth),
                y: Math.floor(worldCoordinates.y / this.tileHeight)
            };
        };
        Tilemap.prototype.toWorldCoordinates = function (tileCoordinates) {
            return {
                x: tileCoordinates.x * this.tileWidth,
                y: tileCoordinates.y * this.tileHeight
            };
        };
        return Tilemap;
    })(Phaser.Tilemap);
    Isis.Tilemap = Tilemap;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    var TilemapLoader = (function () {
        function TilemapLoader(game) {
            this.game = game;
        }
        TilemapLoader.prototype.load = function (key) {
            var manifestEntry = this.game.cache.getJSON("manifest")[key];
            var mapJSON = this.game.cache.getJSON(key + ".json");
            return new Isis.Tilemap({
                game: this.game,
                key: key,
                tilesets: this.readTilesets(manifestEntry),
                tileLayers: this.readLayers(mapJSON.layers)
            });
        };
        TilemapLoader.prototype.readTilesets = function (manifestEntry) {
            return _.chain(manifestEntry).filter({ type: "image" }).map(function (asset) {
                var tileset = asset.url.substring(asset.url.lastIndexOf('/') + 1, asset.url.lastIndexOf('.'));
                return {
                    key: asset.key,
                    name: tileset
                };
            }).value();
        };
        TilemapLoader.prototype.readLayers = function (layers) {
            return _.chain(layers).filter({ type: "tilelayer" }).map(function (layer) { return layer.name; }).value();
        };
        return TilemapLoader;
    })();
    Isis.TilemapLoader = TilemapLoader;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    var Trigger = (function () {
        function Trigger(json) {
            this.x = json.x;
            this.y = json.y;
            this.name = json.name;
            this.properties = json.properties;
        }
        return Trigger;
    })();
    Isis.Trigger = Trigger;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    var WorldCoordinates = (function () {
        function WorldCoordinates() {
        }
        return WorldCoordinates;
    })();
    Isis.WorldCoordinates = WorldCoordinates;
    ;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    var Tests;
    (function (Tests) {
        var SimpleMathTests = (function (_super) {
            __extends(SimpleMathTests, _super);
            function SimpleMathTests() {
                _super.apply(this, arguments);
            }
            SimpleMathTests.prototype.addTwoNumbersWith1And2Expect3 = function () {
                var result = 1 + 2;
                this.areIdentical(3, result);
            };
            SimpleMathTests.prototype.addTwoNumbersWith3And2Expect5 = function () {
                var result = 3 + 2;
                this.areIdentical(4, result); // Deliberate error
            };
            return SimpleMathTests;
        })(tsUnit.TestClass);
        Tests.SimpleMathTests = SimpleMathTests;
    })(Tests = Isis.Tests || (Isis.Tests = {}));
})(Isis || (Isis = {}));
//# sourceMappingURL=game.js.map