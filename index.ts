/** @format */
import { promises as fs } from "fs";
import { Appendices, Bible, Commentary, iData, Verse } from "rev";

async function LoadIfExists<T>(
	path: string,
	fallback: () => Promise<iData<T>>,
): Promise<T[]> {
	interface iFileData {
		date: string | Date;
		data: T[];
	}

	try {
		await fs.stat("data");
	} catch (error) {
		if (error.code === "ENOENT") {
			await fs.mkdir("data");
		}
	}

	try {
		await fs.stat(path);
	} catch (error) {
		if (error.code === "ENOENT") {
			const dataObject = await fallback();
			const { data } = dataObject;
			const output: iFileData = {
				date: new Date(),
				data,
			};
			fs.writeFile(path, JSON.stringify(output), {
				encoding: "utf8",
			});
			return dataObject.data;
		} else {
			throw error;
		}
	}

	const dataString = await fs.readFile(path, {
		encoding: "utf8",
	});
	const dataJson: iFileData = JSON.parse(dataString);

	return dataJson.data;
}

(async function () {
	try {
		const bibleData: Verse[] = await LoadIfExists(
			"data/bible.json",
			Bible.onReady,
		);
		const bible = new Bible(bibleData);
		console.log(bible.ls());

		const appendixData = await LoadIfExists(
			"data/appendices.json",
			Appendices.onReady,
		);
		const appendices = new Appendices(appendixData);
		console.log(appendices.ls());

		const commentaryData = await LoadIfExists(
			"data/commentary.json",
			Commentary.onReady,
		);
		const commentary = new Commentary(commentaryData);
		console.log(commentary.ls());
	} catch (err) {
		console.error(err);
	}
})();
