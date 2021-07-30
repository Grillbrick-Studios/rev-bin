import { log } from "console";
import fetch from "node-fetch";
import { Bible } from "./bible";

Bible.onReady().then((bible) => {
  bible.selectBook("Genesis");
  bible.selectChapter(2);
  log(bible.ls());
  //log(bible.numChapters("Genesis"));
});
