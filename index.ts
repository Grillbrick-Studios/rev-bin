/** @format */
import { promises as fs } from "fs";
import { log } from "console";
import { Appendices, Bible, Commentary } from "./models";

(async function () {
	const book = "Genesis";
	const chapter = 1;
	const verse = 2;

	try {
		await fs.stat("data");
	} catch (error) {
		if (error.code === "ENOENT") {
			await fs.mkdir("data");
		}
	}

	Bible.onReady().then(bible => {
		log("Bible Loaded!");
		bible.selectBook(book);
		bible.selectChapter(chapter);
		bible.selectVerse(verse);
		const funny = bible.getFunnyVerses();
		log(funny);
	});

	Commentary.onReady().then(c => {
		log("Commentary loaded!");
		c.selectBook(book);
		c.selectChapter(chapter);
		c.selectVerse(verse);
	});

	Appendices.onReady().then(_ => {
		log("Appendices loaded!");
	});
})();
