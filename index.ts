import { log } from "console";
import fetch from "node-fetch";
import { iBibleJson, iVerse, PATHS } from "./bible";

async function getBible(): Promise<iVerse[]> {
  let res = await fetch(PATHS.BIBLE);
  let bible: iBibleJson = await res.json();
  return bible.REV_Bible;
}

log("Fetching Bible... Please Wait...");
getBible().then((verses) => {
  let bookArray = verses.map((v) => v.book);
  const bookSet = new Set(bookArray);
  log(bookSet);
});
