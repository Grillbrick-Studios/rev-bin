/** @format */
import { log } from "console";
import fetch from "node-fetch";
import { promises as fs } from "fs";

const URL =
	"https://www.revisedenglishversion.com/jsonrevexport.php?permission=yUp&autorun=1&what=commentary";

const Filename = "data/commentary.json";

interface iCommentary {
	book: string;
	chapter: string;
	verse: string;
	commentary: string;
}

interface CommentaryJson {
	date: Date;
	REV_Commentary: iCommentary[];
}

export class Commentary {
	private static data: iCommentary[];

	private constructor() {}

	private selectedBook?: string;
	private selectedChapter?: number;
	private selectedVerse?: number;

	private static async fetch() {
		log("Fetching commentary from web please wait...");
		let res = await fetch(URL);
		log("Commentary downloaded!");
		let commentary: CommentaryJson = await res.json();
		Commentary.data = commentary.REV_Commentary;
	}

	private static async writeToFile() {
		log("Writing commentary to file please wait...");
		await fs.writeFile(
			Filename,
			JSON.stringify({
				date: new Date(),
				REV_Commentary: Commentary.data,
			}),
			{
				encoding: "utf8",
			},
		);
		log("Commentary Saved");
	}

	private static async readFromFile() {
		log("Loading Commentary from disk.");
		const commentaryString = await fs.readFile(Filename, {
			encoding: "utf8",
		});
		const commentary: CommentaryJson = JSON.parse(commentaryString);
		Commentary.data = commentary.REV_Commentary;
		log("Commentary loaded!");

		// Check for out of date
		if (typeof commentary.date === "string")
			commentary.date = new Date(commentary.date);

		if (
			new Date().getTime() - commentary.date.getTime() >
			1000 * 60 * 60 * 24 * 7
		) {
			log("Commentary out of date!");
			await Commentary.fetch();
			await Commentary.writeToFile();
		}
	}

	private static async init() {
		// check if the file exists
		try {
			await fs.stat(Filename);
			await Commentary.readFromFile();
		} catch (err) {
			if (err.code === "ENOENT") {
				// File doesn't exist
				await Commentary.fetch();
				await Commentary.writeToFile();
			} else {
				log(`An unknown error occured reading the CommentaryFile: ${err}`);
			}
		}
	}

	static async onReady(): Promise<Commentary> {
		if (Commentary.data) return new Commentary();
		else await Commentary.init();
		return new Commentary();
	}

	getBooks(): string[] {
		const booksArray = Commentary.data.map(v => v.book);
		const bookSet = new Set(booksArray);
		return new Array(...bookSet.keys());
	}

	getChapters(book: string) {
		const chapterArray = Commentary.data
			.filter(v => v.book === book)
			.map(v => v.chapter);
		const chapterSet = new Set(chapterArray);
		return new Array(...chapterSet.keys());
	}

	getVerses(book: string, chapter: number, verse?: number): string | string[] {
		if (verse) {
			const verseArray = Commentary.data
				.filter(
					v =>
						v.book === book &&
						v.chapter === chapter.toString() &&
						v.verse === verse.toString(),
				)
				.map(v => v.commentary);
			return verseArray[0];
		} else {
			const verseArray = Commentary.data
				.filter(v => v.book === book && v.chapter === chapter.toString())
				.map(v => v.verse);
			const verseSet = new Set(verseArray);
			return new Array(...verseSet.keys());
		}
	}

	selectBook(book: string) {
		if (this.getBooks().indexOf(book) >= 0) {
			this.selectedBook = book;
		}
	}

	selectChapter(chapter: number) {
		if (!this.selectedBook) return;
		if (this.getChapters(this.selectedBook).indexOf(chapter.toString()) >= 0) {
			this.selectedChapter = chapter;
		}
	}

	selectVerse(verse: number) {
		if (!this.selectedBook || !this.selectedChapter) return;
		if (
			this.getVerses(this.selectedBook, this.selectedChapter).indexOf(
				verse.toString(),
			) >= 0
		) {
			this.selectedVerse = verse;
		}
	}

	ls() {
		const { selectedVerse, selectedChapter, selectedBook } = this;
		if (selectedBook) {
			if (selectedChapter) {
				if (selectedVerse) {
					return this.getVerses(selectedBook, selectedChapter, selectedVerse);
				}
				return this.getVerses(selectedBook, selectedChapter);
			}
			return this.getChapters(selectedBook);
		}
		return this.getBooks();
	}

	up() {
		if (this.selectedVerse) this.selectedVerse = undefined;
		else if (this.selectedChapter) this.selectedChapter = undefined;
		else this.selectedBook = undefined;
	}
}
