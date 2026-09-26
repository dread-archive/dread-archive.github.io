// Catalogue: filter by text and type, sort by column. No dependencies.
(function () {
  var table = document.querySelector("table.cat");
  if (!table) return;
  var tbody = table.tBodies[0];
  var rows = Array.prototype.slice.call(tbody.rows);
  var input = document.getElementById("filter");
  var chips = document.querySelectorAll(".chips button");
  var count = document.getElementById("count");
  var type = "";

  var params = new URLSearchParams(location.search);
  if (input && params.get("q")) input.value = params.get("q");

  function apply() {
    var q = input ? input.value.trim().toLowerCase() : "";
    var shown = 0;
    rows.forEach(function (r) {
      var ok = (!type || r.dataset.type === type) && (!q || r.dataset.q.indexOf(q) !== -1 || r.dataset.id.toLowerCase().indexOf(q) !== -1);
      r.hidden = !ok;
      if (ok) shown++;
    });
    if (count) count.textContent = shown === 1 ? "1 entry." : shown + " entries.";
  }
  if (input) input.addEventListener("input", apply);
  chips.forEach(function (b) {
    b.addEventListener("click", function () {
      type = b.dataset.type;
      chips.forEach(function (c) { c.setAttribute("aria-pressed", c === b ? "true" : "false"); });
      apply();
    });
  });

  table.querySelectorAll("th[data-k]").forEach(function (th) {
    th.addEventListener("click", function () {
      var k = th.dataset.k;
      var asc = th.getAttribute("aria-sort") !== "ascending";
      table.querySelectorAll("th").forEach(function (h) { h.removeAttribute("aria-sort"); });
      th.setAttribute("aria-sort", asc ? "ascending" : "descending");
      rows.sort(function (a, b) {
        var x = a.dataset[k], y = b.dataset[k];
        var nx = parseFloat(x), ny = parseFloat(y);
        var c = (!isNaN(nx) && !isNaN(ny) && k !== "id") ? nx - ny : x.localeCompare(y);
        return asc ? c : -c;
      });
      rows.forEach(function (r) { tbody.appendChild(r); });
    });
  });
  apply();
})();
