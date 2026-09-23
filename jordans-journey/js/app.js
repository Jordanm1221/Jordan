(function () {
  "use strict";

  var trails = (window.TRAILS || []).slice().sort(function (a, b) { return a.rating - b.rating; });
  var ratings = window.RATINGS || [];
  var activeFilter = "All";
  var activeId = null;
  var markers = {};
  var routes = {};

  function $(id) { return document.getElementById(id); }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function ratingInfo(n) {
    for (var i = 0; i < ratings.length; i++) if (n <= ratings[i].max) return ratings[i];
    return ratings[ratings.length - 1] || { label: "", plain: "" };
  }

  function stateOf(t) { return (t.area.split(",")[1] || "").trim(); }

  function fmtDate(d) {
    if (!d) return "";
    var dt = new Date(d + "T12:00:00");
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function num(n) { return Number(n).toLocaleString("en-US"); }

  /* Totals */
  function renderTotals() {
    var miles = trails.reduce(function (s, t) { return s + (Number(t.miles) || 0); }, 0);
    var states = {};
    trails.forEach(function (t) { states[stateOf(t)] = 1; });
    $("stat-trails").textContent = trails.length;
    $("stat-miles").textContent = num(Math.round(miles));
    $("stat-states").textContent = Object.keys(states).length;
    $("stat-videos").textContent = trails.filter(function (t) { return t.video; }).length;
  }

  /* Map */
  var map = L.map("leaflet", { scrollWheelZoom: false, zoomControl: true });
  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    maxZoom: 18,
    subdomains: "abcd",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }).addTo(map);
  map.on("focus", function () { map.scrollWheelZoom.enable(); });
  map.on("blur", function () { map.scrollWheelZoom.disable(); });

  function pinIcon(t, active) {
    return L.divIcon({
      className: "",
      html: '<div class="pin' + (active ? " active" : "") + '">' + t.rating + "</div>",
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  }

  trails.forEach(function (t) {
    var m = L.marker([t.lat, t.lng], { icon: pinIcon(t, false), title: t.name, keyboard: true })
      .addTo(map)
      .on("click", function () { select(t.id, false); });
    m.bindTooltip(t.name, { direction: "top", offset: [0, -16] });
    markers[t.id] = m;
    if (t.gpx) loadGpx(t);
  });

  function loadGpx(t) {
    fetch(t.gpx)
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (xml) {
        var doc = new DOMParser().parseFromString(xml, "application/xml");
        var pts = doc.querySelectorAll("trkpt, rtept");
        var latlngs = Array.prototype.map.call(pts, function (p) {
          return [parseFloat(p.getAttribute("lat")), parseFloat(p.getAttribute("lon"))];
        });
        if (!latlngs.length) return;
        routes[t.id] = L.polyline(latlngs, { color: "#FFFFFF", weight: 3, opacity: 0.85 })
          .addTo(map)
          .on("click", function () { select(t.id, false); });
      })
      .catch(function () { /* No track file yet. The pin still shows. */ });
  }

  function visibleTrails() {
    if (activeFilter === "All") return trails;
    return trails.filter(function (t) { return ratingInfo(t.rating).label === activeFilter; });
  }

  function fitVisible() {
    var list = visibleTrails();
    if (!list.length) return;
    var b = L.latLngBounds(list.map(function (t) { return [t.lat, t.lng]; }));
    map.fitBounds(b, { padding: [48, 48], maxZoom: 11 });
  }

  /* Filters */
  function renderFilters() {
    var labels = ["All"].concat(ratings.map(function (r) { return r.label; }));
    $("filters").innerHTML = labels.map(function (l) {
      return '<button type="button" class="chip" aria-pressed="' + (l === activeFilter) + '" data-filter="' + esc(l) + '">' + esc(l) + "</button>";
    }).join("");
  }
  $("filters").addEventListener("click", function (e) {
    var btn = e.target.closest("[data-filter]");
    if (!btn) return;
    activeFilter = btn.getAttribute("data-filter");
    renderFilters();
    renderList();
    trails.forEach(function (t) {
      var show = activeFilter === "All" || ratingInfo(t.rating).label === activeFilter;
      if (show) { markers[t.id].addTo(map); if (routes[t.id]) routes[t.id].addTo(map); }
      else { markers[t.id].remove(); if (routes[t.id]) routes[t.id].remove(); }
    });
    fitVisible();
  });

  /* List */
  function renderList() {
    var list = visibleTrails();
    $("trail-list").innerHTML = list.length ? list.map(function (t) {
      var r = ratingInfo(t.rating);
      return '<li><button type="button" data-id="' + esc(t.id) + '" aria-current="' + (t.id === activeId) + '">' +
        '<span class="rating-box" aria-label="Difficulty ' + t.rating + ' of 10">' + t.rating + "</span>" +
        '<span><span class="trail-name">' + esc(t.name) + "</span>" +
        '<span class="meta">' + esc(t.area) + " · " + t.miles + " mi · " + esc(r.label) + "</span></span>" +
        "</button></li>";
    }).join("") : '<li class="meta" style="padding:16px">No trails at this level yet.</li>';
  }
  $("trail-list").addEventListener("click", function (e) {
    var btn = e.target.closest("[data-id]");
    if (btn) select(btn.getAttribute("data-id"), true);
  });

  /* Detail */
  function videoHtml(t) {
    if (!t.video) return '<div class="placeholder">Video coming soon</div>';
    return '<div class="video-frame"><iframe src="https://www.youtube-nocookie.com/embed/' + esc(t.video) +
      '" title="' + esc(t.name) + ' video" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe></div>';
  }

  function photosHtml(t) {
    if (!t.photos || !t.photos.length) return '<div class="thumbs"><div class="placeholder">Photos coming soon</div></div>';
    return '<div class="thumbs">' + t.photos.slice(0, 4).map(function (p, i) {
      return '<button type="button" class="photo-btn" data-src="' + esc(p) + '" aria-label="Open photo ' + (i + 1) + ' of ' + esc(t.name) + '"><img src="' + esc(p) + '" alt="' + esc(t.name) + ' photo ' + (i + 1) + '" loading="lazy"></button>';
    }).join("") + "</div>";
  }

  function renderDetail(t) {
    var r = ratingInfo(t.rating);
    var driven = t.date ? "Driven " + fmtDate(t.date) : "Not driven yet";
    $("detail").innerHTML =
      '<div class="detail-head"><h3>' + esc(t.name.toUpperCase()) + '</h3><p class="label">' + esc(t.area) + " · " + esc(driven) + "</p></div>" +
      '<p class="detail-summary">' + esc(t.summary) + "</p>" +
      '<dl class="specs">' +
        '<div><dt>Difficulty</dt><dd><strong>' + t.rating + '/10</strong>' + esc(r.label) + "</dd></div>" +
        '<div><dt>Length</dt><dd><strong>' + t.miles + ' mi</strong>One way</dd></div>' +
        '<div><dt>Time</dt><dd><strong>' + t.hours + ' hr</strong>Plan a full ' + (t.hours > 8 ? "two days" : t.hours > 4 ? "day" : "half day") + "</dd></div>" +
        '<div><dt>Top elevation</dt><dd><strong>' + num(t.elevation) + ' ft</strong>' + (t.elevation >= 10000 ? "Thin air. Bring a jacket." : "Low enough to run year-round in good weather.") + "</dd></div>" +
        '<div><dt>Best time to go</dt><dd><strong>' + esc(t.season.split(",")[0]) + "</strong>" + esc(t.season.split(",").slice(1).join(",").trim() || " ") + "</dd></div>" +
      "</dl>" +
      '<div class="need"><p class="label">What you need</p><p>' + esc(t.vehicle) + "</p></div>" +
      '<div class="media-pair">' + videoHtml(t) + photosHtml(t) + "</div>" +
      '<p class="warning">Conditions change. Check with the local land office before you go.</p>';
  }

  function select(id, pan) {
    var t = trails.find(function (x) { return x.id === id; });
    if (!t) return;
    if (activeId && markers[activeId]) {
      var prev = trails.find(function (x) { return x.id === activeId; });
      markers[activeId].setIcon(pinIcon(prev, false));
    }
    activeId = id;
    markers[id].setIcon(pinIcon(t, true));
    markers[id].setZIndexOffset(1000);
    if (pan) map.flyTo([t.lat, t.lng], Math.max(map.getZoom(), 10), { duration: 0.6 });
    renderList();
    renderDetail(t);
  }

  /* Videos */
  function renderVideos() {
    var withVideo = trails.filter(function (t) { return t.video; });
    if (!withVideo.length) {
      $("video-grid").innerHTML = '<div class="placeholder">Videos go here. Add a YouTube ID to a trail in js/trails.js.</div>';
      return;
    }
    $("video-grid").innerHTML = withVideo.map(function (t) {
      return '<article class="video-card">' + videoHtml(t) +
        "<h3>" + esc(t.name.toUpperCase()) + "</h3>" +
        '<p class="meta">' + esc(t.area) + " · Difficulty " + t.rating + "/10" + (t.date ? " · " + fmtDate(t.date) : "") + "</p>" +
        '<button type="button" class="link-btn" data-show="' + esc(t.id) + '">See on map</button></article>';
    }).join("");
  }
  $("video-grid").addEventListener("click", function (e) {
    var btn = e.target.closest("[data-show]");
    if (!btn) return;
    select(btn.getAttribute("data-show"), true);
    $("map").scrollIntoView();
  });

  /* Photos */
  function renderPhotos() {
    var all = [];
    trails.forEach(function (t) { (t.photos || []).forEach(function (p) { all.push({ src: p, t: t }); }); });
    if (!all.length) {
      $("photo-grid").innerHTML = '<div class="placeholder">Photos go here. Put images in the photos folder and list them on a trail in js/trails.js.</div>';
      return;
    }
    $("photo-grid").innerHTML = all.map(function (p) {
      return '<figure><button type="button" class="photo-btn" data-src="' + esc(p.src) + '" aria-label="Open photo from ' + esc(p.t.name) + '"><img src="' + esc(p.src) + '" alt="' + esc(p.t.name) + '" loading="lazy"></button><figcaption>' + esc(p.t.name) + " · " + esc(p.t.area) + "</figcaption></figure>";
    }).join("");
  }

  /* Lightbox */
  var lastFocus = null;
  function openLightbox(src, alt) {
    lastFocus = document.activeElement;
    $("lightbox-img").src = src;
    $("lightbox-img").alt = alt || "";
    $("lightbox").hidden = false;
    $("lightbox-close").focus();
  }
  function closeLightbox() {
    $("lightbox").hidden = true;
    $("lightbox-img").src = "";
    if (lastFocus) lastFocus.focus();
  }
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".photo-btn");
    if (btn) openLightbox(btn.getAttribute("data-src"), btn.querySelector("img").alt);
  });
  $("lightbox-close").addEventListener("click", closeLightbox);
  $("lightbox").addEventListener("click", function (e) { if (e.target === this) closeLightbox(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !$("lightbox").hidden) closeLightbox(); });

  /* Difficulty scale */
  var lo = 1;
  $("scale").innerHTML = ratings.map(function (r) {
    var html = "<li><span class=\"label\">" + lo + "–" + r.max + "</span><strong>" + esc(r.label) + "</strong><span>" + esc(r.plain) + "</span></li>";
    lo = r.max + 1;
    return html;
  }).join("");

  renderTotals();
  renderFilters();
  renderList();
  renderVideos();
  renderPhotos();
  fitVisible();
  if (trails.length) select(trails[0].id, false);
})();
