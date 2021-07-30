/** @format */

export interface iVerse {
	book: string;
	chapter: number;
	verse: number;
	heading: string;
	microheading: number;
	paragraph: number;
	style: number;
	footnotes: string;
	versetext: string;
}

export class Verse implements iVerse {
	private data: iVerse;

	public get unwrap(): iVerse {
		return this.data;
	}
	constructor(data: iVerse) {
		this.data = data;
	}

	public html(): string {
		let result = this.data.versetext;
		result = result?.replace(/\[hp\]/g, "<br />");
		result = result?.replace(/\[hpbegin\]/g, '<div class="hpbegin">');
		result = result?.replace(/\[lb\]/g, "<br />");
		result = result?.replace(/\[mvh\]/g, "<br />");
		result = result?.replace(/\[br\]/g, "<br />");
		result = result?.replace(/\[fn\]/g, "<footnote />");
		result = result?.replace(/\[\[/g, "<em>");
		result = result?.replace(/\]\]/g, "</em>");
		result = result?.replace(/\[pg\]/g, "<br />");
		result = result?.replace(/\[bq\]/g, '<span class="bq">');
		result = result?.replace(/\[\/bq\]/g, "</span>");
		return `${this.book} ${this.chapter}:${this.verse} ${result}`;
	}
	/// Getters ///
	//#region
	public get book(): string {
		return this.data.book;
	}

	public get chapter(): number {
		return this.data.chapter;
	}

	public get verse(): number {
		return this.data.verse;
	}

	public get heading(): string {
		return this.data.heading;
	}

	public get microheading(): number {
		return this.data.microheading;
	}

	public get paragraph(): number {
		return this.data.paragraph;
	}

	public get style(): number {
		return this.data.style;
	}

	public get footnotes(): string {
		return this.data.footnotes;
	}

	public get versetext(): string {
		return this.data.versetext;
	}
	//#endregion
}
