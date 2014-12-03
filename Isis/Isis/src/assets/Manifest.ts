 module Isis {
	 export interface Manifest {
		 [key: string]: Array<ManifestEntry>;
	 }

	 export interface ManifestEntry {
		 type: string;
		 key: string;
		 url?: string;
	 }
 }