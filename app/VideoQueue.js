import videostream from 'videostream'

export default class VideoQueue {
    constructor(files) {
        if (!Array.isArray(files)) {
            this.files = [files]
        }
        this.bufferNextVideo()
        this.playNextVideo()
    }
    addFile(file){
        this.files.push(file)
        console.log('file added')
        if(this.currentVideo === this.nextVideo) {
            console.log('file added and buffed')
            this.bufferNextVideo()
        }
    }
    bufferNextVideo = () => {
        this.nextVideo = document.createElement('video')
        this.nextVideo.controls = false
        this.nextVideo.addEventListener('onError', this.reportError)
        this.nextVideo.style.zIndex = -1
        this.nextVideo.style.position = 'absolute'
        document.querySelector('body').appendChild(this.nextVideo)
        const file = this.files.shift()
        videostream(file, this.nextVideo)
        // Load it up, then pause and go to beginning
        // this.nextVideo.volume = 0
        this.nextVideo.addEventListener('playing', () => {
            // this.nextVideo.volume = 1
            console.log('resetting video')
            if (this.nextVideo !== this.currentVideo) {
                this.nextVideo.pause()
                this.nextVideo.currentTime = 0
            }
        })
        this.nextVideo.play()

    }
    reportError(error) {
        console.log('got error', error)
    }
    queueFile() {
        const file = this.files.shift()
        videostream(file, this.currentVideo)
    }

    playNextVideo() {
        // swap order of videos
        this.currentVideo = this.nextVideo
        const currentVideo = this.currentVideo
        this.currentVideo.style.zIndex = 1
        this.currentVideo.style.position = 'absolute'
        if(this.files.length) {
            this.bufferNextVideo()
        }

        this.currentVideo.addEventListener('timeupdate', () => {
            const timeDiff = this.currentVideo.duration - this.currentVideo.currentTime
            if(timeDiff > 0.2) {
                return false
            }
            this.removeAllVideoEventListeners(currentVideo)
            if(currentVideo.parentElement) {
                currentVideo.parentElement.removeChild(currentVideo)
            }
            this.playNextVideo()
        })
        console.log('playing video')
        this.currentVideo.play()
    }
    removeAllVideoEventListeners(el) {
        el.removeEventListener('ready')
        el.removeEventListener('timeupdate')
        el.removeEventListener('playing')
    }
}
