/*
  Jordan's Journey — trail data.

  Each trail is one object. To add a trail, copy one block and change the values.

  Fields:
    id          short unique name, no spaces (used in links)
    name        trail name
    area        nearest town and state
    lat, lng    trailhead location (right-click in Google Maps to copy)
    rating      difficulty 1–10 (see RATINGS below)
    miles       one-way trail length
    hours       typical time to drive it
    elevation   highest point, in feet
    season      best months to go
    vehicle     what you need to finish it, in plain words
    summary     1–3 short sentences about the trail
    date        the day you drove it (YYYY-MM-DD), or "" if not yet
    video       YouTube video ID (the part after "v=" in the link), or ""
    photos      list of image paths, e.g. ["photos/hells-revenge-1.jpg"]
    gpx         path to a GPX track file, e.g. "gpx/hells-revenge.gpx", or ""
                (export from onX, Gaia GPS, or your GPS unit). The route
                line is drawn on the map from this file.

  The trails below are EXAMPLES so the site has something to show.
  Check every number before you publish, then add your own trips.
*/

window.RATINGS = [
  { max: 3,  label: "Easy",     plain: "Dirt road. Any SUV with good tires can do it." },
  { max: 5,  label: "Moderate", plain: "Rocks and ruts. You need 4x4 and good ground clearance." },
  { max: 7,  label: "Hard",     plain: "Big rocks and steep climbs. You need 33-inch tires and a locker helps." },
  { max: 10, label: "Extreme",  plain: "Built rigs only. Lockers, 35-inch tires, and a spotter." }
];

window.TRAILS = [
  {
    id: "hells-revenge",
    name: "Hell's Revenge",
    area: "Moab, UT",
    lat: 38.5886, lng: -109.5271,
    rating: 6,
    miles: 6.5,
    hours: 3,
    elevation: 4600,
    season: "Mar–May, Sep–Nov",
    vehicle: "4x4 with 33-inch tires. Lockers help on the steep climbs.",
    summary: "Steep slickrock climbs and drops with a view of the Colorado River. The rock grips well when dry. Stay off it when wet.",
    date: "",
    video: "",
    photos: [],
    gpx: ""
  },
  {
    id: "fins-n-things",
    name: "Fins N Things",
    area: "Moab, UT",
    lat: 38.5705, lng: -109.4937,
    rating: 5,
    miles: 9,
    hours: 3,
    elevation: 4900,
    season: "Mar–May, Sep–Nov",
    vehicle: "Stock 4x4 with low range and good tires.",
    summary: "Rolling slickrock fins, one after another. A good first Moab trail if you have never driven rock.",
    date: "",
    video: "",
    photos: [],
    gpx: ""
  },
  {
    id: "black-bear-pass",
    name: "Black Bear Pass",
    area: "Telluride, CO",
    lat: 37.8986, lng: -107.7109,
    rating: 6,
    miles: 11,
    hours: 4,
    elevation: 12840,
    season: "Late Jul–Sep",
    vehicle: "Short-wheelbase 4x4 with high clearance. Long trucks struggle on the switchbacks.",
    summary: "Tight switchbacks down a cliff face above Telluride. One-way, downhill only. The top is over 12,800 feet.",
    date: "",
    video: "",
    photos: [],
    gpx: ""
  },
  {
    id: "poughkeepsie-gulch",
    name: "Poughkeepsie Gulch",
    area: "Ouray, CO",
    lat: 37.9340, lng: -107.6380,
    rating: 7,
    miles: 4.5,
    hours: 3,
    elevation: 12400,
    season: "Late Jul–Sep",
    vehicle: "Lockers and 33-inch tires or bigger. Expect body damage if you pick a bad line.",
    summary: "Short and rough. A rock ledge near the top stops most stock trucks. Old mines line the valley.",
    date: "",
    video: "",
    photos: [],
    gpx: ""
  },
  {
    id: "rubicon",
    name: "Rubicon Trail",
    area: "Lake Tahoe, CA",
    lat: 39.0045, lng: -120.2447,
    rating: 9,
    miles: 22,
    hours: 16,
    elevation: 7000,
    season: "Jul–Oct",
    vehicle: "Built rig only. Lockers front and rear, 35-inch tires, rock sliders, and a winch.",
    summary: "The most famous hard trail in the country. Plan two days and camp at Rubicon Springs.",
    date: "",
    video: "",
    photos: [],
    gpx: ""
  }
];
