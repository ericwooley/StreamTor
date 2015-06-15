/* eslint-disable */
import {MP4Box} from 'mp4box'

var HIGH_WATER_MARK = 10000000; // 1MB
var LOW_WATER_MARK = 1000000; // 100kB
var APPEND_RETRY_TIME = 5; // seconds

/**
 * Stream data from `file` into `this.mediaElem`.
 * `file` must be an object with a `length` property giving the file size in bytes,
 * and a `createReadStream(opts)` method that retunr a string and accepts opts.start
 * and opts.end to specify a byte range (inclusive) to fetch.
 * @param {File} file described above
 * @param {HTMLthis.MediaElement} this.mediaElem <audio> or <video> element
 * @param {Object} opts Options
 * @param {number=} opts.this.debugTrack Track to save for debugging. Defaults to -1 (none)
 */
class VideStream {
  constructor(file, mediaElem, opts) {
    opts = opts || {}
    this.debugTrack = opts.debugTrack || -1;
    this.debugBuffers = [];
    this.mediaElem = mediaElem
    this.file = file
    this.mediaElem.addEventListener('waiting', () => {
      if (this.ready) {
        this.seek(this.mediaElem.currentTime);
      }
    });
    this.mediaSource = new MediaSource();
    this.mediaSource.addEventListener('sourceopen', () => {
      this.makeRequest(0);
    });
    this.mediaElem.src = window.URL.createObjectURL(this.mediaSource);
    this.mp4box = new MP4Box();
    this.mp4box.onError = this.handleMp4BoxError
    this.ready = false;
    this.totalWaitingBytes = 0;
    this.tracks = {}; // keyed by track id
    this.mp4box.onReady = this.setupVideo
    this.mp4box.onSegment = this.handleSegment
    this.requestOffset; // Position in the file where `stream` will next provide data
    this.stream = null;
    // var stream
    this.detachStream = null;
  }
  resumeStream = () => {
    // Always wait till the next run of the event loop to cause async break
    setTimeout(() => {
      if (this.stream) {
        // TODO: remove stream._readableState.flowing once stream.isPaused is available
        if (this.stream.isPaused ? this.stream.isPaused() : !this.stream._readableState.flowing) {
          this.stream.resume();
        }
      }
    })
  }
  makeRequest = (pos) => {
    if (pos === this.file.length) {
      this.mp4box.flush(); // All done!
      return;
    }

    if (this.stream && pos === this.requestOffset) {
      return; // There is althis.ready a stream at the right position, so just let it continue
    }

    if (this.stream) {
      this.stream.destroy(); // There is a stream, but not at the right position
      this.detachStream();
    }

    this.requestOffset = pos;
    var streamOptions = {
      start: this.requestOffset,
      end: this.file.length - 1
    };
    // There is necessarily only one stream that is not detached/destroyed at one time,
    // so it's safe to overwrite the var from the outer scope
    // stream = file.createReadStream(streamOptions);
    this.stream = this.file.createReadStream(streamOptions);
    this.stream.on('data', this.onData);
    this.stream.on('end', this.onEnd);
    this.stream.on('error', this.onStreamError);
    // This needs to be reassigned, every time. Not sure the logic behind it.
    this.detachStream = () => {
      this.stream.removeListener('data', this.onData);
      this.stream.removeListener('end', this.onEnd);
      this.stream.removeListener('error', this.onStreamError);
      // stream = null
      this.stream = null
      this.detachStream = null;
    }
  }
  onStreamError = (err) => {
    console.error('Stream error:', err);
    if (this.mediaSource.readyState === 'open') {
      this.mediaSource.endOfStream('network');
    }
  }
  onEnd = () => {
    this.detachStream();
    this.makeRequest(this.requestOffset);
  }
  onData = (data) => {
          // Pause the stream and resume it on the next run of the event loop to avoid
          // lots of 'data' event blocking the UI
          this.stream.pause();
          // Only resume if there isn't too much data that this.mp4box has processed that hasn't
          // gone to the browser
          if (this.totalWaitingBytes <= HIGH_WATER_MARK) {
          this.resumeStream();
          }

          var arrayBuffer = data.toArrayBuffer(); // TODO: avoid copy
          // sample output here http://pastebin.com/dyC9ME3P
          console.group('Array Buffer Append')
          console.log('Appending array buffer', arrayBuffer, 'byteLength', arrayBuffer.byteLength)
          arrayBuffer.fileStart = this.requestOffset;
          this.requestOffset += arrayBuffer.byteLength;
          var nextOffset;
          try {
          // MP4Box tends to blow up ungracefully when it can't parse the mp4 input, so
          // use a try/catch
              nextOffset = this.mp4box.appendBuffer(arrayBuffer);
          // // Prevent infinte loops if this.mp4box keeps requesting the same data
          // if (nextOffset === arrayBuffer.fileStart) {
          //  throw new Error('MP4Box parsing stuck at offset: ' + nextOffset);
          // }
          } catch (err) {
              console.error('MP4Box threw exception:', err);
              // This will fire the 'error' event on the audio/video element
              if (this.mediaSource.readyState === 'open') {
                  this.mediaSource.endOfStream('decode');
              }
              this.stream.destroy();
              this.detachStream();
              throw err
          }
          console.log('Next Offset', nextOffset)
          console.groupEnd('Array Buffer Append')
          this.makeRequest(nextOffset);
      }
  handleSegment = (id, user, buffer, nextSample) => {
    var track = this.tracks[id];
    this.appendBuffer(track, buffer, nextSample === track.meta.nb_samples);
    if (id === this.debugTrack && this.debugBuffers) {
      this.debugBuffers.push(buffer);
      if (nextSample > 1000) {
        save('track-' + this.debugTrack + '.mp4', this.debugBuffers);
        this.debugBuffers = null;
      }
    }
  };
  handleMp4BoxError = (e) => {
    console.error('MP4Box error:', e);
    if (this.detachStream) {
      this.detachStream();
    }
    if (this.mediaSource.readyState === 'open') {
      this.mediaSource.endOfStream('decode');
    }
  };
  updateEnded = () => {
    if (this.mediaSource.readyState !== 'open') {
      return;
    }

    var ended = Object.keys(this.tracks).every((id) => {
      var track = this.tracks[id];
      return track.ended && !track.buffer.updating;
    });

    if (ended && this.mediaSource.readyState === 'open') {
      this.mediaSource.endOfStream();
    }
  }
  seek = (seconds) => {
    var seekResult = this.mp4box.seek(seconds, true);
    console.log('Seeking to time: ', seconds);
    console.log('Seeked file offset:', this.seekResult.offset);
    this.makeRequest(this.seekResult.offset);
    this.resumeStream();
  }
  appendBuffer = (track, buffer, ended) => {
    this.totalWaitingBytes += buffer.byteLength;
    track.arrayBuffers.push({
      buffer: buffer,
      ended: ended || false
    });
    this.popBuffers(track);
  }
  popBuffers = (track) => {
    if (track.buffer.updating || track.arrayBuffers.length === 0) return;
    var buffer = track.arrayBuffers.shift();
    var appended = false;
    try {
      track.buffer.appendBuffer(buffer.buffer);
      track.ended = buffer.ended;
      appended = true;
    } catch (e) {
      console.error('SourceBuffer error: ', e);
      // Wait and try again later (assuming buffer space was the issue)
      track.arrayBuffers.unshift(buffer);
      setTimeout(() => {
        this.popBuffers(track);
      }, APPEND_RETRY_TIME);
    }
    if (appended) {
      this.totalWaitingBytes -= buffer.buffer.byteLength;
      if (this.totalWaitingBytes <= LOW_WATER_MARK) {
        this.resumeStream();
      }
      this.updateEnded(); // call this.mediaSource.endOfStream() if needed
    }
  }
  setupVideo = (info) => {
    console.log('MP4 info:', info);
    info.tracks.forEach((track) => {
      var mime;
      if (track.video) {
        mime = 'video/mp4';
      } else if (track.audio) {
        mime = 'audio/mp4';
      } else {
        return;
      }
      mime += '; codecs="' + track.codec + '"';
      if (MediaSource.isTypeSupported(mime)) {
        var sourceBuffer = this.mediaSource.addSourceBuffer(mime);
        var trackEntry = {
          buffer: sourceBuffer,
          arrayBuffers: [],
          meta: track,
          ended: false
        };
        sourceBuffer.addEventListener('updateend', this.popBuffers.bind(null, trackEntry));
        this.mp4box.setSegmentOptions(track.id, null, {
          // It really isn't that inefficient to give the data to the browser on every frame (for video)
          nbSamples: track.video ? 1 : 100
        });
        this.tracks[track.id] = trackEntry
      }
    });

    var initSegs = this.mp4box.initializeSegmentation();
    initSegs.forEach((initSegment) => {
      this.appendBuffer(this.tracks[initSegment.id], initSegment.buffer);
      if (initSegment.id === this.debugTrack) {
        save('init-track-' + this.debugTrack + '.mp4', [initSegment.buffer]);
        this.debugBuffers.push(initSegment.buffer);
      }
    });
    this.ready = true;
  };
}


export
default VideStream

/**
  Saves an array of ArrayBuffers to the given filename.
  @param {string} filename Filename to save as.
  @param {Array.<ArrayBuffer>}
  */
function save(filename, buffers) {
  var blob = new Blob(buffers);
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', filename);
  a.click();
}
