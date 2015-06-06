import alt from '../alt'
import AppActions from '../actions/AppActions'

let appStore = alt.createStore(class AppStore {
  constructor() {
    this.bindActions(AppActions)
    this.dataByRestApi = {}
    this.data = {}
  }
})

module.exports = appStore
