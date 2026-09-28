// Session archive: a static page. The typed word never leaves the browser.
// Each log is stored encrypted (AES-GCM, key from PBKDF2-SHA256). The word is used
// locally to try to open each log; nothing is sent anywhere.
(function () {
  var logs = window.SESSION_LOGS || [];
  var form = document.getElementById("t-form");
  var input = document.getElementById("t-input");
  var out = document.getElementById("t-out");
  var STORE = "da-sessions-open";

  function bytes(b64) {
    return Uint8Array.from(atob(b64), function (c) { return c.charCodeAt(0); });
  }
  function normalise(s) {
    return s.toLowerCase().replace(/[^a-z0-9]/g, "");
  }
  function remembered() {
    try { return JSON.parse(localStorage.getItem(STORE) || "{}"); } catch (e) { return {}; }
  }
  function remember(id, data) {
    try { var m = remembered(); m[id] = data; localStorage.setItem(STORE, JSON.stringify(m)); } catch (e) {}
  }
  function markOpen(id) {
    var li = document.querySelector('#t-list li[data-id="' + id + '"] .t-state');
    if (li) { li.textContent = "open"; li.classList.add("is-open"); }
  }

  async function tryWord(word) {
    if (!window.crypto || !crypto.subtle) return null;
    var base = await crypto.subtle.importKey("raw", new TextEncoder().encode(word), "PBKDF2", false, ["deriveKey"]);
    for (var i = 0; i < logs.length; i++) {
      var log = logs[i];
      var key = await crypto.subtle.deriveKey(
        { name: "PBKDF2", salt: bytes(log.salt), iterations: log.iterations, hash: "SHA-256" },
        base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
      try {
        var plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: bytes(log.iv) }, key, bytes(log.ct));
        return { id: log.id, data: JSON.parse(new TextDecoder().decode(plain)) };
      } catch (e) { /* not this one */ }
    }
    return null;
  }

  function show(id, data) {
    out.innerHTML = "";
    var head = document.createElement("p");
    head.className = "t-head";
    head.textContent = id + " · " + data.stamp;
    out.appendChild(head);
    data.lines.forEach(function (line, i) {
      var p = document.createElement("p");
      p.className = line.indexOf("USER:") === 0 ? "t-user" : "t-ai";
      p.textContent = line;
      p.style.animationDelay = (i * 0.35) + "s";
      out.appendChild(p);
    });
    if (data.next) {
      var n = document.createElement("p");
      n.className = "t-dim t-next";
      n.textContent = data.next;
      n.style.animationDelay = (data.lines.length * 0.35 + 0.4) + "s";
      out.appendChild(n);
    }
  }

  form.addEventListener("submit", async function (ev) {
    ev.preventDefault();
    var word = normalise(input.value);
    input.value = "";
    if (!word) return;
    out.innerHTML = '<p class="t-dim">…</p>';
    var found = await tryWord(word);
    if (!found) {
      out.innerHTML = '<p class="t-dim">not this one.</p>';
      return;
    }
    remember(found.id, found.data);
    markOpen(found.id);
    show(found.id, found.data);
  });

  var seen = remembered();
  Object.keys(seen).forEach(markOpen);
  document.querySelectorAll("#t-list li").forEach(function (li) {
    li.addEventListener("click", function () {
      var id = li.getAttribute("data-id");
      if (seen[id]) show(id, seen[id]);
    });
  });
})();
