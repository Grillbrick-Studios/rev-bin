/** @format */
import { log } from "console";
import fetch from "node-fetch";

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

export interface iBibleJson {
  REV_Bible: iVerse[];
}

export const PATHS = {
  BIBLE:
    "https://www.revisedenglishversion.com/jsonrevexport.php?permission=yUp&autorun=1&what=bible",
  APPENDICES:
    "https://www.revisedenglishversion.com/jsonrevexport.php?permission=yUp&autorun=1&what=appendices",
  COMMENTARY:
    "https://www.revisedenglishversion.com/jsonrevexport.php?permission=yUp&autorun=1&what=commentary",
};

export class Bible {
  private static verses: iVerse[];

  private constructor() {}

  private selectedBook?: string;
  private selectedChapter?: number;
  private selectedVerse?: number;

  public get Verses(): iVerse[] {
    return Bible.verses;
  }

  static async init() {
    log("Fetching bible. Please wait...");
    let res = await fetch(PATHS.BIBLE);
    let bible: iBibleJson = await res.json();
    Bible.verses = bible.REV_Bible;
  }

  static async onReady(
    cb: (verses: Bible) => void = (_) => {}
  ): Promise<Bible> {
    if (Bible.verses) cb(new Bible());
    else await Bible.init();
    cb(new Bible());
    return new Bible();
  }

  getBooks(): string[] {
    const booksArray = Bible.verses.map((v) => v.book);
    const bookSet = new Set(booksArray);
    return new Array(...bookSet.keys());
  }

  getChapters(book: string) {
    const chaptersArray = Bible.verses
      .filter((v) => v.book === book)
      .map((v) => v.chapter);
    const chapterSet = new Set(chaptersArray);
    return new Array(...chapterSet.keys());
  }

  numChapters(book: string): number {
    return this.getChapters(book).length;
  }

  getVerses(book: string, chapter: number, verse?: number): iVerse[] {
    if (verse)
      return Bible.verses.filter(
        (v) => v.book === book && v.chapter === chapter && v.verse === verse
      );
    return Bible.verses.filter((v) => v.book === book && v.chapter === chapter);
  }

  getVerseNumbers(book: string, chapter: number): number[] {
    return this.getVerses(book, chapter).map((v) => v.verse);
  }

  numVerses(book: string, chapter: number): number {
    return this.getVerses(book, chapter).length;
  }

  ls(): iVerse[] | number[] | string[] {
    if (this.selectedVerse && this.selectedChapter && this.selectedBook)
      return this.getVerses(
        this.selectedBook,
        this.selectedChapter,
        this.selectedVerse
      );
    if (this.selectedChapter && this.selectedBook)
      return this.getVerseNumbers(this.selectedBook, this.selectedChapter);
    if (this.selectedBook) return this.getChapters(this.selectedBook);
    return this.getBooks();
  }

  selectBook(book: string) {
    this.getBooks().forEach((bk) => {
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
    else if (this.selectedBook) this.selectedBook = undefined;
  }
}
