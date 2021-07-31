/** @format */
import { promises as fs } from "fs";
import { log } from "console";
import { Appendices, Bible, Commentary } from "./models";

(async function () {
	try {
		await fs.stat("data");
	} catch (error) {
		if (error.code === "ENOENT") {
			await fs.mkdir("data");
		}
	}
	const bible = await Bible.onReady();
	log("Bible Loaded!");
	const book = "Genesis";
	const chapter = 1;
	const verse = 2;
	bible.selectBook(book);
	bible.selectChapter(chapter);
	bible.selectVerse(verse);

	const c = await Commentary.onReady();
	log("Commentary loaded!");
	c.selectBook(book);
	c.selectChapter(chapter);
	c.selectVerse(verse);

	const a = await Appendices.onReady();
	log("Appendices loaded!");
})();
