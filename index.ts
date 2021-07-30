/** @format */

import { log } from "console";
import { Bible } from "./bible";

Bible.onReady().then(bible => {
	log(bible.getFunnyVerses());
});
