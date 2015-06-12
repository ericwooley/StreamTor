/* global MediaSource */
import {MP4Box} from 'mp4box'


// TODO investigate to make sure that all callbacks are scoped properly.

/**
 * Stream data from `file` into `mediaElem`.
 * `file` must be an object with a `length` property giving the file size in bytes,
 * and a `createReadStream(opts)` method that retunr a string and accepts opts.start
 * and opts.end to specify a byte range (inclusive) to fetch.
 * @param {File} file described above
 * @param {HTMLMediaElement} mediaElem <audio> or <video> element
 * @param {Object} opts Options
 * @param {number=} opts.debugTrack Track to save for debugging. Defaults to -1 (none)
 */
export default class VideoQueue {
  HIGH_WATER_MARK = 10000000 // 1MB
  LOW_WATER_MARK = 1000000 // 100kB
  APPEND_RETRY_TIME = 5 // seconds
  opts
  debugTrack// = opts.debugTrack || -1;
  debugBuffers = []
  mediaSource = new MediaSource()
  mediaElem
  ready = false
  mp4box
  totalWaitingBytes = 0
  tracks = {} // keyed by track id
  requestOffset // Position in the file where `stream` will next provide data
  stream = null
  detachStream = null
  file
  constructor(file, mediaElem, opts = {}){
    this.file = file
    this.mediaElem = mediaElem
    this.opts = opts
    this.debugTrack = opts.debugTrack || -1
    mediaElem.addEventListener('waiting', this.seekToElementTime)
    this.mp4box = new MP4Box()
    this.mp4box.onReady = this.mp4BoxGotInfo
    this.mp4box.onError = this.handleMp4BoxError
    this.mp4box.onSegment = this.handleSegment
    mediaElem.src = window.URL.createObjectURL(this.mediaSource)
    this.mediaSource.addEventListener('sourceopen', () => this.makeRequest(0))
  }
  handleMp4BoxError = (e) => {
    console.error('MP4Box error:', e)
    if(this.detachStream) {
      this.detachStream()
    }
    if (this.mediaSource.readyState === 'open') {
      this.mediaSource.endOfStream('decode')
    }
  }
  seekToElementTime = () => {
    if (this.ready) {
      this.seek(this.mediaElem.currentTime)
    }
  }
  mp4BoxGotInfo = (info) => {
    console.log('MP4 info:', info)
    info.tracks.forEach(function (track) {
      let mime
      if (track.video) {
        mime = 'video/mp4'
      } else if (track.audio) {
        mime = 'audio/mp4'
      } else {
        return
      }
      mime += '; codecs="' + track.codec + '"'
      if (MediaSource.isTypeSupported(mime)) {
        let sourceBuffer = this.mediaSource.addSourceBuffer(mime)
        let trackEntry = {
          buffer: sourceBuffer,
          arrayBuffers: [],
          meta: track,
          ended: false
        }
        sourceBuffer.addEventListener('updateend', this.popBuffers.bind(null, trackEntry))
        this.mp4box.setSegmentOptions(track.id, null, {
          // It really isn't that inefficient to give the data to the browser on every frame (for video)
          nbSamples: track.video ? 1 : 100
        })
        this.tracks[track.id] = trackEntry
      }
    })

    let initSegs = this.mp4box.initializeSegmentation()
    initSegs.forEach(function (initSegment) {
      this.appendBuffer(this.tracks[initSegment.id], initSegment.buffer)
      if (initSegment.id === this.debugTrack) {
        this.save('init-track-' + this.debugTrack + '.mp4', [initSegment.buffer])
        this.debugBuffers.push(initSegment.buffer)
      }
    })
    this.ready = true
  }
  handleSegment = (id, user, buffer, nextSample) => {
    let track = this.tracks[id]
    this.appendBuffer(track, buffer, nextSample === track.meta.nb_samples)
    if (id === this.debugTrack && this.debugBuffers) {
      this.debugBuffers.push(buffer)
      if (nextSample > 1000) {
        this.save('track-' + this.debugTrack + '.mp4', this.debugBuffers)
        this.debugBuffers = null
      }
    }
  }
  makeRequest = (pos) => {
    console.log('mediaSource ready')
    if (pos === this.file.length) {
      this.mp4box.flush() // All done!
      return
    }

    if (this.stream && pos === this.requestOffset) {
      return // There is already a stream at the right position, so just let it continue
    }

    if (this.stream) {
      this.stream.destroy() // There is a stream, but not at the right position
      this.detachStream()
    }

    this.requestOffset = pos
    let opts = {
      start: this.requestOffset,
      end: this.file.length - 1
    }
    // There is necessarily only one stream that is not detached/destroyed at one time,
    // so it's safe to overwrite the let from the outer scope
    this.stream = this.file.createReadStream(opts)
    this.stream.on('data', this.onData())
    this.stream.on('end', this.onEnd())
    this.stream.on('error', this.onStreamError())
  }
  detachStream = () => {
    this.stream.removeListener('data', this.onData())
    this.stream.removeListener('end', this.onEnd())
    this.stream.removeListener('error', this.onStreamError())
    this.stream = null
    this.detachStream = null
  }
  onData() {
    const that = this
    return (data) => {
      // Pause the stream and resume it on the next run of the event loop to avoid
      // lots of 'data' event blocking the UI
      that.stream.pause()
      // Only resume if there isn't too much data that mp4box has processed that hasn't
      // gone to the browser
      if (that.totalWaitingBytes <= that.HIGH_WATER_MARK) {
        that.resumeStream()
      }

      let arrayBuffer = data.toArrayBuffer() // TODO: avoid copy
      arrayBuffer.fileStart = that.requestOffset
      that.requestOffset += arrayBuffer.byteLength
      let nextOffset
      try {
        // MP4Box tends to blow up ungracefully when it can't parse the mp4 input, so
        // use a try/catch
        nextOffset = that.mp4box.appendBuffer(arrayBuffer)
        // // Prevent infinte loops if mp4box keeps requesting the same data
        // if (nextOffset === arrayBuffer.fileStart) {
        //  throw new Error('MP4Box parsing stuck at offset: ' + nextOffset)
        // }
      } catch (err) {
        console.error('MP4Box threw exception:', err)
        // this will fire the 'error' event on the audio/video element
        if (that.mediaSource.readyState === 'open') {
          that.mediaSource.endOfStream('decode')
        }
        that.stream.destroy()
        that.detachStream()
        return
      }
      that.makeRequest(nextOffset)
    }
  }
  onEnd() {
    const that = this
    return () => {
      that.detachStream()
      that.makeRequest(that.requestOffset)
    }
  }
  onStreamError(err) {
    const that = this
    return () => {
      console.error('Stream error:', err)
      if (that.mediaSource.readyState === 'open') {
        that.mediaSource.endOfStream('network')
      }
    }
  }
  seek = (seconds) => {
    let seekResult = this.mp4box.seek(seconds, true)
    console.log('Seeking to time: ', seconds)
    console.log('Seeked file offset:', seekResult.offset)
    this.makeRequest(seekResult.offset)
    this.resumeStream()
  }

  appendBuffer = (track, buffer, ended) => {
    this.totalWaitingBytes += buffer.byteLength
    track.arrayBuffers.push({
      buffer: buffer,
      ended: ended || false
    })
    this.popBuffers(track)
  }

  popBuffers = (track) => {
    if (track.buffer.updating || track.arrayBuffers.length === 0){
      return null
    }
    let buffer = track.arrayBuffers.shift()
    let appended = false
    try {
      track.buffer.appendBuffer(buffer.buffer)
      track.ended = buffer.ended
      appended = true
    } catch (e) {
      console.error('SourceBuffer error: ', e)
      // Wait and try again later (assuming buffer space was the issue)
      track.arrayBuffers.unshift(buffer)
      setTimeout(function () {
        this.popBuffers(track)
      }, this.APPEND_RETRY_TIME)
    }
    if (appended) {
      this.totalWaitingBytes -= buffer.buffer.byteLength
      if (this.totalWaitingBytes <= this.LOW_WATER_MARK) {
        this.resumeStream()
      }
      this.updateEnded() // call mediaSource.endOfStream() if needed
    }
  }

  resumeStream = () => {
    // Always wait till the next run of the event loop to cause async break
    setTimeout(function () {
      if (this.stream) {
        // TODO: remove this.stream._readableState.flowing once this.stream.isPaused is available
        if (this.stream.isPaused ? this.stream.isPaused() : !this.stream._readableState.flowing) {
          this.stream.resume()
        }
      }
    })
  }

  updateEnded = () =>{
    if (this.mediaSource.readyState !== 'open') {
      return
    }

    let ended = Object.keys(this.tracks).every(function (id) {
      let track = this.tracks[id]
      return track.ended && !track.buffer.updating
    })

    if (ended && this.mediaSource.readyState === 'open') {
      this.mediaSource.endOfStream()
    }
  }
  /**
    Saves an array of ArrayBuffers to the given filename.
    @param {string} filename Filename to save as.
    @param {Array.<ArrayBuffer>}
    */
  save (filename, buffers) {
    let blob = new Blob(buffers)
    let url = URL.createObjectURL(blob)
    let a = document.createElement('a')
    a.setAttribute('href', url)
    a.setAttribute('download', filename)
    a.click()
  }
}
