module Isis {
	export function fileExists(path: string): boolean {
		var request = new XMLHttpRequest();
		request.open("HEAD", path, false);
		request.send();

		return request.status != 404;
	}
} 