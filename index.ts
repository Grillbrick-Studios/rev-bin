/** @format */
import { promises as fs } from "fs";
import { Appendices, Bible, Commentary, iData, Verse } from "rev";
import Menu from "simple-terminal-menu";

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

let bible: Bible;
let appendices: Appendices;
let commentary: Commentary;

function mainMenu() {
	const menu = new Menu({
		width: 80,
		selected: 0,
	});
	if (menu === null) {
		console.log("Interactive menu not supported");
		process.exit(1);
	}

	menu.writeTitle("Welcome to the REV App");
	menu.writeSubtitle("Main Menu");
	menu.writeSeparator();

	menu.add("Bible", () => {
		subMenu(bible);
	});
	menu.add("Commentary", () => {
		subMenu(commentary);
	});
	menu.add("Appendices", () => {
		subMenu(appendices);
	});
	menu.add("Exit", () => {
		menu.close();
	});
}

function subMenu<T>(data: iData<T>) {
	const ls = data.ls();

	if (ls.length === 1) {
		// TODO: render html to terminal here
	}

	const menu = new Menu({
		width: 80,
		selected: 0,
	});
	if (menu === null) {
		console.log("Interactive menu not supported");
		process.exit(1);
	}

	menu.writeTitle("Welcome to the REV App");
	menu.writeSubtitle(data.path);
	menu.writeSeparator();

	menu.add("..", _ => {
		if (data.up()) subMenu(data);
		else {
			mainMenu();
		}
	});

	ls.forEach(label => {
		menu.add(label, value => {
			data.select(value);
			subMenu(data);
		});
	});
}

(async function () {
	try {
		const bibleData: Verse[] = await LoadIfExists(
			"data/bible.json",
			Bible.onReady,
		);
		bible = new Bible(bibleData);

		const appendixData = await LoadIfExists(
			"data/appendices.json",
			Appendices.onReady,
		);
		appendices = new Appendices(appendixData);

		const commentaryData = await LoadIfExists(
			"data/commentary.json",
			Commentary.onReady,
		);
		commentary = new Commentary(commentaryData);

		mainMenu();

		// Error handling here
	} catch (err) {
		console.error(err);
	}
})();
