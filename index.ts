/** @format */
import { promises as fs } from "fs";
import { log } from "console";
import { Bible, Verse } from "rev";

interface iData<T> {
	data: T;
}

async function LoadIfExists<T>(
	path: string,
	fallback: () => Promise<iData<T>>,
): Promise<T> {
	interface iFileData {
		date: string | Date;
		data: T;
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
			const data = await fallback();
			log("Bible Loaded!");
			const output: iFileData = {
				date: new Date(),
				data: data.data,
			};
			fs.writeFile(path, JSON.stringify(output), {
				encoding: "utf8",
			});
			return data.data;
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
		Bible.data = bibleData;
		console.log(bible.ls());
	} catch (err) {
		console.error(err);
	}
})();
