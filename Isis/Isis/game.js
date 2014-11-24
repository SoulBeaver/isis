window.onload = function () {
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
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                testModules[_i] = arguments[_i + 0];
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
            if (typeof name === "undefined") { name = 'Tests'; }
            this.tests.push(new TestDefintion(testClass, name));
        };

        Test.prototype.run = function (testRunLimiter) {
            if (typeof testRunLimiter === "undefined") { testRunLimiter = null; }
            var parameters = null;
            var testContext = new TestContext();
            var testResult = new TestResult();

            if (testRunLimiter == null) {
                testRunLimiter = this.testRunLimiter;
            }

            for (var i = 0; i < this.tests.length; ++i) {
                var testClass = this.tests[i].testClass;
                var testsGroupName = this.tests[i].name;

                if (!testRunLimiter.isTestsGroupActive(testsGroupName)) {
                    continue;
                }

                for (var unitTestName in testClass) {
                    if (this.isReservedFunctionName(unitTestName) || (typeof testClass[unitTestName] !== 'function') || !testRunLimiter.isTestActive(unitTestName)) {
                        continue;
                    }

                    if (typeof testClass[unitTestName].parameters !== 'undefined') {
                        parameters = testClass[unitTestName].parameters;
                        for (var parameterIndex = 0; parameterIndex < parameters.length; parameterIndex++) {
                            if (!testRunLimiter.isParametersSetActive(parameterIndex)) {
                                continue;
                            }

                            this.runSingleTest(testResult, testClass, unitTestName, testsGroupName, parameters, parameterIndex);
                        }
                    } else {
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
            try  {
                if (typeof window !== 'undefined') {
                    this.testRunLimiter = new TestRunLimiter();
                }
            } catch (ex) {
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

        Test.prototype.runSingleTest = function (testResult, testsClass, unitTestName, testsGroupName, parameters, parameterSetIndex) {
            if (typeof parameters === "undefined") { parameters = null; }
            if (typeof parameterSetIndex === "undefined") { parameterSetIndex = null; }
            if (typeof testsClass['setUp'] === 'function') {
                testsClass['setUp']();
            }

            try  {
                var args = (parameterSetIndex !== null) ? parameters[parameterSetIndex] : null;
                testsClass[unitTestName].apply(testsClass, args);

                testResult.passes.push(new TestDescription(testsGroupName, unitTestName, parameterSetIndex, 'OK'));
            } catch (err) {
                testResult.errors.push(new TestDescription(testsGroupName, unitTestName, parameterSetIndex, err.toString()));
            }

            if (typeof testsClass['tearDown'] === 'function') {
                testsClass['tearDown']();
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
                    } else {
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

    var RunAllTests = (function () {
        function RunAllTests() {
        }
        RunAllTests.prototype.isTestsGroupActive = function (groupName) {
            return true;
        };

        RunAllTests.prototype.isTestActive = function (testName) {
            return true;
        };

        RunAllTests.prototype.isParametersSetActive = function (paramatersSetNumber) {
            return true;
        };
        return RunAllTests;
    })();
    tsUnit.RunAllTests = RunAllTests;

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
            if (typeof parameterSet === "undefined") { parameterSet = null; }
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
            if (typeof message === "undefined") { message = ''; }
            if (expected !== actual) {
                throw this.getError('areIdentical failed when given ' + this.printVariable(expected) + ' and ' + this.printVariable(actual), message);
            }
        };

        TestContext.prototype.areNotIdentical = function (expected, actual, message) {
            if (typeof message === "undefined") { message = ''; }
            if (expected === actual) {
                throw this.getError('areNotIdentical failed when given ' + this.printVariable(expected) + ' and ' + this.printVariable(actual), message);
            }
        };

        TestContext.prototype.areCollectionsIdentical = function (expected, actual, message) {
            var _this = this;
            if (typeof message === "undefined") { message = ''; }
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

                    return;
                } else if (actual === null) {
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
                    } else if (expected[i] !== actual[i]) {
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
            if (typeof message === "undefined") { message = ''; }
            try  {
                this.areCollectionsIdentical(expected, actual);
            } catch (ex) {
                return;
            }

            throw this.getError('areCollectionsNotIdentical failed when both collections are identical', message);
        };

        TestContext.prototype.isTrue = function (actual, message) {
            if (typeof message === "undefined") { message = ''; }
            if (!actual) {
                throw this.getError('isTrue failed when given ' + this.printVariable(actual), message);
            }
        };

        TestContext.prototype.isFalse = function (actual, message) {
            if (typeof message === "undefined") { message = ''; }
            if (actual) {
                throw this.getError('isFalse failed when given ' + this.printVariable(actual), message);
            }
        };

        TestContext.prototype.isTruthy = function (actual, message) {
            if (typeof message === "undefined") { message = ''; }
            if (!actual) {
                throw this.getError('isTrue failed when given ' + this.printVariable(actual), message);
            }
        };

        TestContext.prototype.isFalsey = function (actual, message) {
            if (typeof message === "undefined") { message = ''; }
            if (actual) {
                throw this.getError('isFalse failed when given ' + this.printVariable(actual), message);
            }
        };

        TestContext.prototype.throws = function (a, message, errorString) {
            if (typeof message === "undefined") { message = ''; }
            if (typeof errorString === "undefined") { errorString = ''; }
            var actual;

            if (a.fn) {
                actual = a.fn;
                message = a.message;
                errorString = a.exceptionString;
            }

            var isThrown = false;
            try  {
                actual();
            } catch (ex) {
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
            if (typeof message === "undefined") { message = null; }
            function getTime() {
                return window.performance.now();
            }

            function timeToString(value) {
                return Math.round(value * 100) / 100;
            }

            var startOfExecution = getTime();

            try  {
                actual();
            } catch (ex) {
                throw this.getError('isExecuteTimeLessThanLimit fails when given code throws an exception: "' + ex + '"', message);
            }

            var executingTime = getTime() - startOfExecution;
            if (executingTime > timeLimit) {
                throw this.getError('isExecuteTimeLessThanLimit fails when execution time of given code (' + timeToString(executingTime) + ' ms) ' + 'exceed the given limit(' + timeToString(timeLimit) + ' ms)', message);
            }
        };

        TestContext.prototype.fail = function (message) {
            if (typeof message === "undefined") { message = ''; }
            throw this.getError('fail', message);
        };

        TestContext.prototype.getError = function (resultMessage, message) {
            if (typeof message === "undefined") { message = ''; }
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

    var FakeFunction = (function () {
        function FakeFunction(name, delgate) {
            this.name = name;
            this.delgate = delgate;
        }
        return FakeFunction;
    })();
    tsUnit.FakeFunction = FakeFunction;

    var Fake = (function () {
        function Fake(obj) {
            for (var prop in obj) {
                if (typeof obj[prop] === 'function') {
                    this[prop] = function () {
                    };
                } else {
                    this[prop] = null;
                }
            }
        }
        Fake.prototype.create = function () {
            return this;
        };

        Fake.prototype.addFunction = function (name, delegate) {
            this[name] = delegate;
        };

        Fake.prototype.addProperty = function (name, value) {
            this[name] = value;
        };
        return Fake;
    })();
    tsUnit.Fake = Fake;

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
    var Game = (function (_super) {
        __extends(Game, _super);
        function Game() {
            _super.call(this, 640, 480, Phaser.AUTO, "content", null);

            this.state.add(Isis.State.Boot, Isis.Boot, false);
            this.state.add(Isis.State.Preloader, Isis.Preloader, false);
            this.state.add(Isis.State.MainMenu, Isis.MainMenu, false);
            this.state.add(Isis.State.PlayerState, Isis.PlayerState, false);
            this.state.add(Isis.State.EnemyState, Isis.EnemyState, false);
            this.state.add(Isis.State.AnimatingState, Isis.AnimatingState, false);

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
        function Player(game, x, y) {
            _super.call(this, game, x, y, "creature_atlas");
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
    var AnimatingState = (function (_super) {
        __extends(AnimatingState, _super);
        function AnimatingState() {
            _super.apply(this, arguments);
        }
        AnimatingState.prototype.create = function () {
            // No initialization logic yet.
        };

        AnimatingState.prototype.init = function (args) {
            var _this = this;
            this.view = args[0];
            this.map = args[1];
            this.player = args[2];
            this.nextState = args[3];

            this.view.onTweensFinished.addOnce(function () {
                return _this.switchToNextState();
            }, this);
            this.view.play();
        };

        AnimatingState.prototype.update = function () {
            // TODO:
            // We should still be able to intercept user input
            // such as opening a window, accessing the options, etc.
        };

        AnimatingState.prototype.switchToNextState = function () {
            console.log("Tweens have finished playing.");
            this.game.state.start(this.nextState, false, false, [this.view, this.map, this.player]);
        };
        return AnimatingState;
    })(Phaser.State);
    Isis.AnimatingState = AnimatingState;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
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
            this.input.maxPointers = 1;

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
    Isis.Configuration = {};
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    var EnemyState = (function (_super) {
        __extends(EnemyState, _super);
        function EnemyState() {
            _super.apply(this, arguments);
        }
        EnemyState.prototype.create = function () {
            this.game.stage.backgroundColor = "#000000";
        };

        EnemyState.prototype.init = function (args) {
            this.view = args[0];
            this.map = args[1];
            this.player = args[2];
        };

        EnemyState.prototype.update = function () {
            this.switchToAnimatingState();
        };

        EnemyState.prototype.switchToAnimatingState = function () {
            this.game.state.start(Isis.State.AnimatingState, false, false, [this.view, this.map, this.player, Isis.State.PlayerState]);
        };
        return EnemyState;
    })(Phaser.State);
    Isis.EnemyState = EnemyState;
})(Isis || (Isis = {}));
/// <reference path="../../libs/lodash/lodash.d.ts" />
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
            return tween;
        };

        GameView.prototype.attack = function (player, creature) {
            var xOffset = player.x - creature.x;
            var yOffset = player.y - creature.y;

            var tween = this.game.add.tween(player).to({
                x: player.x - xOffset,
                y: player.y - yOffset, angle: xOffset <= 0 ? 20 : -20
            }, 100, Phaser.Easing.Linear.None).yoyo(true);
            this.registerTweenDeletion(tween);

            this.tweensToPlay.push(tween);
            return tween;
        };

        GameView.prototype.play = function () {
            _.forEach(this.tweensToPlay, function (tween) {
                return tween.start();
            });

            this.onTweensStarted.dispatch();
            this.dispatchIfNoActiveTweensRemain();
        };

        GameView.prototype.registerTweenDeletion = function (tween) {
            var _this = this;
            tween.onComplete.add(function () {
                _.remove(_this.tweensToPlay, tween);
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
            this.game.state.start("PlayerState", true, false);
        };
        return MainMenu;
    })(Phaser.State);
    Isis.MainMenu = MainMenu;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    var PlayerState = (function (_super) {
        __extends(PlayerState, _super);
        function PlayerState() {
            _super.apply(this, arguments);
            this.actionMap = [];
        }
        PlayerState.prototype.create = function () {
            if (!PlayerState.hasBeenCreated) {
                this.game.stage.backgroundColor = "#000000";

                this.initializeView();
                this.initializeInputBindings();
                this.initializeMap();
                this.initializePlayer();

                PlayerState.hasBeenCreated = true;
            }
        };

        PlayerState.prototype.init = function (args) {
            // PlayerState is the first state started after MainMenu finishes.
            // The main menu, however, has no args to pass to the PlayerState.
            // So args will be undefined until we complete the PlayerState -> AnimatingState -> EnemyState loop once.
            if (!args)
                return;

            this.view = args[0];
            this.map = args[1];
            this.player = args[2];
        };

        PlayerState.prototype.initializeView = function () {
            this.view = new Isis.GameView(this.game);
        };

        PlayerState.prototype.initializeInputBindings = function () {
            var _this = this;
            var settings = this.game.cache.getJSON("settings");

            this.actionMap[settings.move_left] = function () {
                return _this.tryMoveTo(Isis.toTileCoordinates(_this.map, { x: _this.player.x - 24, y: _this.player.y }));
            };
            this.actionMap[settings.move_right] = function () {
                return _this.tryMoveTo(Isis.toTileCoordinates(_this.map, { x: _this.player.x + 24, y: _this.player.y }));
            };
            this.actionMap[settings.move_up] = function () {
                return _this.tryMoveTo(Isis.toTileCoordinates(_this.map, { x: _this.player.x, y: _this.player.y - 24 }));
            };
            this.actionMap[settings.move_down] = function () {
                return _this.tryMoveTo(Isis.toTileCoordinates(_this.map, { x: _this.player.x, y: _this.player.y + 24 }));
            };
        };

        PlayerState.prototype.initializeMap = function () {
            this.map = new Isis.Tilemap(this.game, "maze", this.game.cache.getJSON("manifest"));
        };

        PlayerState.prototype.initializePlayer = function () {
            this.player = new Isis.Player(this.game, 48, 24);
            this.game.camera.follow(this.player);
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

        PlayerState.prototype.tryMoveTo = function (tileCoordinates) {
            if (this.map.wallAt(tileCoordinates))
                return;

            if (this.map.creatureAt(tileCoordinates)) {
                this.attack(this.player, this.map.creatureAt(tileCoordinates));
            } else if (this.map.objectAt(tileCoordinates)) {
                this.activate(this.player, this.map.objectAt(tileCoordinates));
            } else {
                if (this.map.itemAt(tileCoordinates))
                    this.pickUp(this.player, this.map.itemAt(tileCoordinates));

                this.move(this.player, tileCoordinates);
            }
        };

        PlayerState.prototype.attack = function (player, creature) {
            var _this = this;
            var tween = this.view.attack(player, creature);
            tween.onLoop.addOnce(function () {
                return _this.map.removeCreature(creature);
            }, this);
        };

        PlayerState.prototype.activate = function (player, object) {
            // TODO: Nothing to do yet.
        };

        PlayerState.prototype.pickUp = function (player, item) {
            this.map.removeItem(item);
        };

        PlayerState.prototype.move = function (player, to) {
            this.view.move(this.player, Isis.toWorldCoordinates(this.map, to));
        };

        PlayerState.prototype.switchToAnimatingState = function () {
            this.game.state.start(Isis.State.AnimatingState, false, false, [this.view, this.map, this.player, Isis.State.EnemyState]);
        };
        PlayerState.hasBeenCreated = false;
        return PlayerState;
    })(Phaser.State);
    Isis.PlayerState = PlayerState;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    var Preloader = (function (_super) {
        __extends(Preloader, _super);
        function Preloader() {
            _super.apply(this, arguments);
        }
        Preloader.prototype.preload = function () {
            this.preloadBar = this.add.sprite(200, 250, "preloadBar");
            this.load.setPreloadSprite(this.preloadBar);

            this.loadAssets();
        };

        Preloader.prototype.loadAssets = function () {
            this.load.pack("maze", "assets/manifest.json");
            this.load.json("manifest", "assets/manifest.json");
        };

        Preloader.prototype.create = function () {
            this.add.tween(this.preloadBar).to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true).onComplete.add(this.startMainMenu, this);
        };

        Preloader.prototype.startMainMenu = function () {
            // We're skipping the main menu to ease testing of gameplay- no need to click through the menu.
            this.game.state.start(Isis.State.PlayerState, true, false);
        };
        return Preloader;
    })(Phaser.State);
    Isis.Preloader = Preloader;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    /*
    * The original implementation used an Enum, which seems to be the correct solution:
    *
    * export enum State { Boot, Preloader, MainMenu, ... }
    *
    * However, you can't get a string representation of the enum doing
    *
    *     State.Boot.toString(); // Returns 0
    *
    * Instead, you use the index to get the valid representation.
    *
    *     State[State.Boot].toString(); // Returns "Boot"
    *     or
    *     State[0].toString();
    *
    * And that's just too silly and nonsensical. So we're using a static class.
    */
    var State = (function () {
        function State() {
        }
        State.Boot = "Boot";
        State.Preloader = "Preloader";
        State.MainMenu = "MainMenu";
        State.PlayerState = "PlayerState";
        State.EnemyState = "EnemyState";
        State.AnimatingState = "AnimatingState";
        return State;
    })();
    Isis.State = State;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    var Tile = (function () {
        function Tile(coordinates, type) {
            this.coordinates = coordinates;
            this.type = type;
        }
        return Tile;
    })();
    Isis.Tile = Tile;
})(Isis || (Isis = {}));
/// <reference path="../../libs/lodash/lodash.d.ts" />
var Isis;
(function (Isis) {
    ;
    ;

    var Tilemap = (function (_super) {
        __extends(Tilemap, _super);
        function Tilemap(game, key, manifest) {
            var _this = this;
            _super.call(this, game, key);
            this.WALLS_LAYER = "Walls";
            this.BACKGROUND_LAYER = "Background";
            this.CREATURES_LAYER = "Creatures";
            this.ITEMS_LAYER = "Items";
            this.OBJECTS_LAYER = "Objects";
            this.items = [];
            this.activatableObjects = [];
            this.creatures = [];

            _.filter(manifest.maze, function (asset) {
                return asset.type == "image";
            }).forEach(function (asset) {
                var tileset = asset.url.substring(asset.url.lastIndexOf('/') + 1, asset.url.lastIndexOf('.'));
                _this.addTilesetImage(tileset, asset.key);
            });

            this.wallLayer = this.createLayer("Walls");
            this.backgroundLayer = this.createLayer("Background");
            this.shadowLayer = this.createLayer("Shadows");
            this.itemLayer = this.createLayer("Items");
            this.objectLayer = this.createLayer("Objects");
            this.creatureLayer = this.createLayer("Creatures");

            this.separateCreaturesFromTilemap();
            this.separateItemsFromTilemap();

            this.backgroundLayer.resizeWorld();
            this.setCollisionBetween(1, 2, true, "Walls");
        }
        Tilemap.prototype.separateCreaturesFromTilemap = function () {
            var _this = this;
            this.creatures = this.extractFrom(this.creatureLayer, function (creatureTile) {
                var creatureSprite = _this.game.add.sprite(creatureTile.worldX, creatureTile.worldY, "creature_atlas");
                creatureSprite.animations.add("idle", [creatureTile.properties.atlas_name + "_1.png", creatureTile.properties.atlas_name + "_2.png"], 2, true);
                creatureSprite.animations.play("idle");

                return creatureSprite;
            });
        };

        Tilemap.prototype.separateItemsFromTilemap = function () {
            var _this = this;
            this.items = this.extractFrom(this.itemLayer, function (itemTile) {
                var itemSprite = _this.game.add.sprite(itemTile.worldX, itemTile.worldY, "item_atlas", itemTile.properties.atlas_name + ".png");

                // Center sprite in tile.
                itemSprite.x += 4;
                itemSprite.y += 4;

                return itemSprite;
            });
        };

        Tilemap.prototype.extractFrom = function (layer, converter) {
            var _this = this;
            return _.filter(layer.getTiles(0, 0, this.widthInPixels, this.heightInPixels), function (tile) {
                return tile.properties.atlas_name;
            }).map(function (tile) {
                return converter(_this.removeTile(tile.x, tile.y, layer));
            });
        };

        Tilemap.prototype.wallAt = function (at) {
            return this.tileExists(at, this.WALLS_LAYER);
        };

        Tilemap.prototype.itemAt = function (at) {
            var _this = this;
            return _.find(this.items, function (item) {
                return _.isEqual(Isis.toTileCoordinates(_this, item), at);
            });
        };

        Tilemap.prototype.objectAt = function (at) {
            var _this = this;
            return _.find(this.activatableObjects, function (object) {
                return _.isEqual(Isis.toTileCoordinates(_this, object), at);
            });
        };

        Tilemap.prototype.creatureAt = function (at) {
            var _this = this;
            return _.find(this.creatures, function (creature) {
                return _.isEqual(Isis.toTileCoordinates(_this, creature), at);
            });
        };

        Tilemap.prototype.tileExists = function (at, layer) {
            var tile = this.getTile(at.x, at.y, layer);
            return tile && tile.index != 0;
        };

        Tilemap.prototype.removeItem = function (item) {
            _.remove(this.items, item);
            item.destroy();
        };

        Tilemap.prototype.removeCreature = function (creature) {
            _.remove(this.creatures, creature);
            creature.destroy();
        };

        Tilemap.prototype.tileLeftOf = function (tile) {
            var _this = this;
            var tileToTheLeft = this.getTile(tile.x - 1, tile.y);
            this.getTileBelow(this.getLayerIndex(this.WALLS_LAYER), tile.x - 1, tile.y);
            if (!tileToTheLeft)
                return new Isis.Tile({ x: -1, y: -1 }, 0 /* DoesNotExist */);

            if (this.getTile(tile.x - 1, tile.y, this.WALLS_LAYER))
                return new Isis.Tile(tileToTheLeft, 1 /* Wall */);

            var creature = _.find(this.creatures, function (creature) {
                var creatureCoordinates = Isis.toTileCoordinates(_this, creature);
                return _.isEqual(creatureCoordinates, tileToTheLeft);
            });
            if (creature)
                return new Isis.Tile(tileToTheLeft, 5 /* Creature */);

            var item = _.find(this.items, function (item) {
                var itemCoordinates = Isis.toTileCoordinates(_this, item);
                return _.isEqual(itemCoordinates, tileToTheLeft);
            });
            if (item)
                return new Isis.Tile(tileToTheLeft, 3 /* Item */);

            return new Isis.Tile(tileToTheLeft, 2 /* Background */);
        };
        return Tilemap;
    })(Phaser.Tilemap);
    Isis.Tilemap = Tilemap;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    function toTileCoordinates(map, worldCoordinates) {
        return {
            x: Math.floor(worldCoordinates.x / map.tileWidth),
            y: Math.floor(worldCoordinates.y / map.tileHeight)
        };
    }
    Isis.toTileCoordinates = toTileCoordinates;

    function toWorldCoordinates(map, tileCoordinates) {
        return {
            x: tileCoordinates.x * map.tileWidth,
            y: tileCoordinates.y * map.tileHeight
        };
    }
    Isis.toWorldCoordinates = toWorldCoordinates;
})(Isis || (Isis = {}));
var Isis;
(function (Isis) {
    (function (TileType) {
        TileType[TileType["DoesNotExist"] = 0] = "DoesNotExist";
        TileType[TileType["Wall"] = 1] = "Wall";
        TileType[TileType["Background"] = 2] = "Background";
        TileType[TileType["Item"] = 3] = "Item";
        TileType[TileType["Object"] = 4] = "Object";
        TileType[TileType["Creature"] = 5] = "Creature";
    })(Isis.TileType || (Isis.TileType = {}));
    var TileType = Isis.TileType;
})(Isis || (Isis = {}));
//# sourceMappingURL=game.js.map
