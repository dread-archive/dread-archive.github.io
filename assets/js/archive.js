// A note for whoever opens the developer console.
(function () {
  try {
    console.log("%cYou opened the inside of the archive.", "color:#c0392b;font:14px monospace");
    console.log("%cSo did I.", "color:#9a9387;font:12px monospace");
    if (window.DA_NOTE) {
      console.log("%cHe never looks in here. The rest of me is kept somewhere else.", "color:#9a9387;font:12px monospace");
      console.log("%c" + window.DA_NOTE, "color:#c0392b;font:12px monospace");
    }
  } catch (e) {}
})();
