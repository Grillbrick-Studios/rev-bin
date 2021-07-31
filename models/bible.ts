/** @format */

import { log } from "console";
import fetch from "node-fetch";
import { promises as fs } from "fs";
import { iVerse, Verse } from "./verse";

export const URL =
	"https://www.revisedenglishversion.com/jsonrevexport.php?permission=yUp&autorun=1&what=bible";

const Filename = "data/bible.json";

export interface iBibleJson {
	date: Date | string;
	REV_Bible: iVerse[];
}

export class Bible {
	private static verses: Verse[];

	private constructor() {}

	private selectedBook?: string;
	private selectedChapter?: number;
	private selectedVerse?: number;

	private static async fetch() {
		log("Fetching bible from web. Please wait...");

		let res = await fetch(URL);
		let bible: iBibleJson = await res.json();
		Bible.verses = bible.REV_Bible.map(v => new Verse(v));
		log("Bible downloaded!");
	}

	private static async writeToFile() {
		log("Saving Bible to file. Please wait...");

		fs.writeFile(
			Filename,
			JSON.stringify({
				date: new Date(),
				REV_Bible: Bible.verses.map(v => v.unwrap),
			}),
			{
				encoding: "utf8",
			},
		);
		log("Bible Saved to disk!");
	}

	private static async readFromFile() {
		log("Fetching bible from file. Please wait...");

		const bibleString: string = await fs.readFile(Filename, {
			encoding: "utf-8",
		});
		const bible: iBibleJson = JSON.parse(bibleString);
		Bible.verses = bible.REV_Bible.map(v => new Verse(v));
		log("Bible loaded from disk");

		// check if the date is outdated
		if (typeof bible.date === "string") bible.date = new Date(bible.date);

		if (new Date().getTime() - bible.date.getTime() > 1000 * 60 * 60 * 24 * 7) {
			log("Bible out of date - updating...");
			await Bible.fetch();
			await Bible.writeToFile();
		}
	}

	static async init() {
		// check if the file exists.
		try {
			await fs.stat(Filename);
			await Bible.readFromFile();
		} catch (err) {
			if (err.code === "ENOENT") {
				// BibleFile doesn't exist.
				await Bible.fetch();
				await Bible.writeToFile();
			} else {
				log(`An unknown error occured reading the BibleFile: ${err}`);
			}
		}
	}

	static async onReady(cb: (verses: Bible) => void = _ => {}): Promise<Bible> {
		if (Bible.verses) cb(new Bible());
		else await Bible.init();
		cb(new Bible());
		return new Bible();
	}

	getFunnyVerses() {
		const funnyVerses = Bible.verses
			.map(v => v.html())
			.filter(v => v.indexOf("[") >= 0 || v.indexOf("]") >= 0);
		return funnyVerses;
	}

	getBooks(): string[] {
		const booksArray = Bible.verses.map(v => v.book);
		const bookSet = new Set(booksArray);
		return new Array(...bookSet.keys());
	}

	getChapters(book: string) {
		const chaptersArray = Bible.verses
			.filter(v => v.book === book)
			.map(v => v.chapter);
		const chapterSet = new Set(chaptersArray);
		return new Array(...chapterSet.keys());
	}

	numChapters(book: string): number {
		return this.getChapters(book).length;
	}

	getVerses(book: string, chapter: number, verse?: number): Verse[] {
		if (verse)
			return Bible.verses.filter(
				v => v.book === book && v.chapter === chapter && v.verse === verse,
			);
		return Bible.verses.filter(v => v.book === book && v.chapter === chapter);
	}

	getVerseNumbers(book: string, chapter: number): number[] {
		return this.getVerses(book, chapter).map(v => v.verse);
	}

	numVerses(book: string, chapter: number): number {
		return this.getVerses(book, chapter).length;
	}

	ls(): Verse[] | number[] | string[] {
		if (this.selectedVerse && this.selectedChapter && this.selectedBook)
			return this.getVerses(
				this.selectedBook,
				this.selectedChapter,
				this.selectedVerse,
			);
		if (this.selectedChapter && this.selectedBook)
			return this.getVerseNumbers(this.selectedBook, this.selectedChapter);
		if (this.selectedBook) return this.getChapters(this.selectedBook);
		return this.getBooks();
	}

	selectBook(book: string) {
		this.getBooks().forEach(bk => {
			if (bk === book) this.selectedBook = book;
		});
	}

	selectChapter(chapter: number) {
		if (!this.selectedBook) return;
		if (chapter > this.numChapters(this.selectedBook)) return;
		this.selectedChapter = chapter;
	}

	selectVerse(verse: number) {
		if (!this.selectedBook || !this.selectedChapter) return;
		if (verse > this.numVerses(this.selectedBook, this.selectedChapter)) return;
		this.selectedVerse = verse;
	}

	up() {
		if (this.selectedVerse) this.selectedVerse = undefined;
		else if (this.selectedChapter) this.selectedChapter = undefined;
		else this.selectedBook = undefined;
	}
}
