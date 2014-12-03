module Isis.Tests {
	export class SimpleMathTests extends tsUnit.TestClass {
		addTwoNumbersWith1And2Expect3() {
			var result = 1 + 2;

			this.areIdentical(3, result);
		}

		addTwoNumbersWith3And2Expect5() {
			var result = 3 + 2;

			this.areIdentical(4, result); // Deliberate error
		}
	}
} 