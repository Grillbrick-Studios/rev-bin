/** @format */
import { log } from "console";
import fetch from "node-fetch";
import { promises as fs } from "fs";

const URL =
	"https://www.revisedenglishversion.com/jsonrevexport.php?permission=yUp&autorun=1&what=appendices";

const Filename = "data/appendices.json";

interface iAppendices {
	title: string;
	appendix: string;
}

interface iAppendicesJson {
	date: Date;
	REV_Appendices: iAppendices[];
}

export class Appendices {
	private static data: iAppendices[];

	private constructor() {}

	private static async fetch() {
		log("Fetching appendices from the web. please wait...");
		let res = await fetch(URL);
		log("appendices downloaded!");
		let commentary = await res.json();
		Appendices.data = commentary;
	}

	private static async writeToFile() {
		log("writing appendices to a local file. please wait...");
		const data: iAppendicesJson = {
			date: new Date(),
			REV_Appendices: Appendices.data,
		};

		fs.writeFile(Filename, JSON.stringify(data), {
			encoding: "utf8",
		});
		log("appendices saved!");
	}

	private static async readFromFile() {
		log("Reading appendices from disk. please wait...");
		const commentaryString = await fs.readFile(Filename, {
			encoding: "utf8",
		});
		const appendices: iAppendicesJson = JSON.parse(commentaryString);
		Appendices.data = appendices.REV_Appendices;
		log("appendices loaded from disk!");

		// Check for out of date
		if (typeof appendices.date === "string")
			appendices.date = new Date(appendices.date);

		if (
			new Date().getTime() - appendices.date.getTime() >
			1000 * 60 * 60 * 24 * 7
		) {
			log("appendices out of date - refreshing");
			await Appendices.fetch();
			await Appendices.writeToFile();
		}
	}

	private static async init() {
		// check if the file exists
		try {
			await fs.stat(Filename);
			await Appendices.readFromFile();
		} catch (err) {
			if (err.code === "ENOENT") {
				// File doesn't exist
				await Appendices.fetch();
				await Appendices.writeToFile();
			} else {
				console.error(
					`An unknown error occured reading the CommentaryFile: ${err}`,
				);
			}
		}
	}

	static async onReady(): Promise<Appendices> {
		if (Appendices.data) return new Appendices();
		else await Appendices.init();
		return new Appendices();
	}

	getTitles() {
		return Appendices.data.map(a => a.title);
	}

	getAppendix(title: string) {
		return Appendices.data.filter(a => a.title === title)[0].appendix;
	}
}
