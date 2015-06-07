import recordRTC from 'recordrtc'
function hasGetUserMedia() {
  // Note: Opera is unprefixed.
  return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia)
}

// getUserMedia to work normally
window.URL = window.URL || window.webkitURL
navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                           navigator.msGetUserMedia

class Recorder {
  static hasGetUserMedia = hasGetUserMedia
  startRecording({onSuccess, onFail, interval, doneRecording, videoEl}) {
    if (navigator.getUserMedia) {
      navigator.getUserMedia({audio: true, video: true}, (stream) => {
        if(videoEl) {
          videoEl.src = window.URL.createObjectURL(stream)
          videoEl.play()
        }
        this.stream = stream
        this.streamRecorder = recordRTC(stream)
        this.streamRecorder.startRecording()
        if(interval) {
          setInterval(() => this.getVideo(doneRecording), interval)
        }
        onSuccess(this)
      }, onFail)
    } else {
      onFail('No stream available')
    }
  }
  getVideo = (cb) => {
    this.streamRecorder.stopRecording(cb)
  }
  stopRecording = (cb = () => console.log('got data')) => {
    this.streamRecorder.stopRecording(() => {
      this.streamRecorder.getDataURL(function(dataURL) {
        cb(dataURL)
      })
      this.stream.stop()
    })
    // setTimeout(() => this.streamRecorder.getDataURL(cb), 2000)
    // this.streamRecorder.getDataURL(cb)

  }
}

// var video = document.querySelector('video')
// var streamRecorder
// var webcamstream

// if (navigator.getUserMedia) {
//   navigator.getUserMedia({audio: true, video: true}, function(stream) {
//     video.src = window.URL.createObjectURL(stream)
//     webcamstream = stream
// //  streamrecorder = webcamstream.record()
//   }, onVideoFail)
// } else {
//   console.log('failed')
// }

// function stopRecording() {
//   streamRecorder.getRecordedData(() => console.log('got stream'))
// }

// function startRecording() {
//   streamRecorder = webcamstream.record()
//   setTimeout(stopRecording, 10000)
// }

// function onUploadSuccess() {
//   alert ('video uploaded')
// }

export default Recorder
export {hasGetUserMedia}
