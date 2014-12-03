window.onload = () => {
	var test = new tsUnit.Test(Isis.Tests);

	// Use the built in results display
	test.showResults(document.getElementById("results"), test.run());

    var game = new Isis.Game();
};