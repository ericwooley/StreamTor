# Running

~~~bash
npm install && npm run dev && open http://localhost:9000
~~~


# What is this?
This is a prototype live streaming service using webtorrent, and is meant to be used in conjunction with https://github.com/ericwooley/streamChunkVM

# How to run it
It's pretty aweful right now,
open up instant.io and seed some mp4 files, grab their hashes.

run the project and go to http://localhost:9000/view/%5B"torrenthash","torrenthash2","torrenthash3","torrenthash4","torrenthash5","torrenthash6"%5D

The video's should start playing
