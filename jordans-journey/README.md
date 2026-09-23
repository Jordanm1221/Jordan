# Jordan's Journey

An off-road trail log. Every trail gets a pin on a map, a difficulty rating from 1 to 10, the truck setup you need, and the video and photos from the run.

## See it

Open `index.html` in a browser. To load GPX route files, run a small local server from this folder:

```
python3 -m http.server 8000
```

Then go to http://localhost:8000.

## Add a trail

All trail info lives in one file: `js/trails.js`. Copy a trail block, change the values, save. The map, list, videos, and photos update on their own.

- **Video:** paste the YouTube ID (the part after `v=` in the link) into `video`.
- **Photos:** put images in `photos/` and list them, e.g. `["photos/rubicon-1.jpg"]`.
- **Route line:** export a GPX file from onX, Gaia GPS, or your GPS unit. Put it in `gpx/` and set `gpx: "gpx/rubicon.gpx"`.

The five trails in the file now are examples. Check every number before you publish.

## Put it online

It is plain HTML, CSS, and JavaScript with no build step. GitHub Pages, Netlify, or Cloudflare Pages can host this folder as-is.
