/**************************
*  EXT-SelfiesViewer v1.0 *
*  node_helper            *
*                         *
*  Bugsounet              *
*  11/2022                *
***************************/

var NodeHelper = require("node_helper");
var fs = require("fs");
var log = (...args) => { /* do nothing */ };

module.exports = NodeHelper.create({
  start: function() {
    this.config = null
    this.imagePath= 'modules/EXT-Selfies/photos',
    this.imageList = []
  },

  socketNotificationReceived: function(noti, payload) {
    switch (noti) {
      case "INIT":
        this.config = payload
        if (this.config.debug) log = (...args) => { console.log("[SELFIESVIEWER]", ...args) }
        console.log("[SELFIESVIEWER] EXT-SelfiesViewer Version:", require('./package.json').version, "rev:", require('./package.json').rev)
        this.initialize()
        break
      case "SCAN":
        this.imageList = []
        this.initialize()
        break
    }
  },

  initialize: async function () {
    this.imageList = this.getImageList()
    log("Nb Images found:", this.imageList.length)
    if (this.imageList.length) {
      this.sendSocketNotification("LIST", this.imageList)
    } else {
      this.sendSocketNotification("EMPTY")
    }
  },

  /** Tools **/
  // sort by filename (newer or older)
  sortByFilename: function (a, b) {
    aL = a.toLowerCase()
    bL = b.toLowerCase()
    if ((aL < bL) && this.config.sortBy == "new") return 1
    if ((aL > bL) && this.config.sortBy == "old") return 1
    else return -1
  },

  // random Sort
  randomSort: function (array) {
    let currentIndex = array.length,  randomIndex
    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex--
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]
      ]
    }

    return array
  },

  // get images list
  getImageList: function() {
    var imageList = []
    try {
      log("Read Image Path from " + this.imagePath + "...")
      var FileList = fs.readdirSync(path = this.imagePath)
    } catch (e) {
      console.log("[SELFIESVIEWER] hey! EXT-Selfies is not installed!")
      return []
    }
    log("Result:" , FileList)

    if (FileList.length) {
      var ImageList = []
      log("Check valid picture...")
      FileList.forEach(file => {
        var isValidImageFileExtension = this.checkValidImageFileExtension(file)
        if (isValidImageFileExtension) ImageList.push(file)
      })
      log("Result:", ImageList)
      if (this.config.sortBy == "random") {
        log("Random Sort selected...")
        ImageList = this.randomSort(ImageList)
      } else {
        log(this.config.sortBy + " Sort selected...")
        ImageList = ImageList.sort(this.sortByFilename)
      }
      imageList = imageList.concat(ImageList)
      log("Final Result:", imageList)
    }
    return imageList
  },

  // check if it's an valid image 'jpg' file extension
  checkValidImageFileExtension: function(filename) {
    var found = false
    if (filename.toLowerCase().endsWith("jpg")) found = true
    return found
  },
});
