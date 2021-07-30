/** @format */

import { log } from "console";
import { Bible } from "./models";

Bible.onReady().then(bible => {
	log(bible.getFunnyVerses());
});
