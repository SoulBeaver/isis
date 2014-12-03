window.onload = () => {
	var test = new tsUnit.Test(Isis.Tests);
	test.showResults(document.getElementById("results"), test.run());

    var game = new Isis.Game();
};