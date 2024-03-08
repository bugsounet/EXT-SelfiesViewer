/*********************
*  EXT-SelfiesViewer *
*  node_helper       *
*********************/

var fs = require("fs");
var NodeHelper = require("node_helper");

var log = (...args) => { /* do nothing */ };

module.exports = NodeHelper.create({
  start () {
    this.config = null;
    this.imagePath= "modules/EXT-Selfies/photos",
    this.imageList = [];
  },

  socketNotificationReceived (noti, payload) {
    switch (noti) {
      case "INIT":
        this.config = payload;
        if (this.config.debug) log = (...args) => { console.log("[SELFIESVIEWER]", ...args); };
        console.log("[SELFIESVIEWER] EXT-SelfiesViewer Version:", require("./package.json").version, "rev:", require("./package.json").rev);
        this.initialize();
        break;
      case "SCAN":
        this.imageList = [];
        this.initialize();
        break;
    }
  },

  async initialize () {
    this.imageList = this.getImageList();
    log("Nb Images found:", this.imageList.length);
    if (this.imageList.length) {
      this.sendSocketNotification("LIST", this.imageList);
    } else {
      this.sendSocketNotification("EMPTY");
    }
  },

  /** Tools **/
  // sort by filename (newer or older)
  sortByFilename (a, b) {
    aL = a.toLowerCase();
    bL = b.toLowerCase();
    if ((aL < bL) && this.config.sortBy === "new") return 1;
    if ((aL > bL) && this.config.sortBy === "old") return 1;
    else return -1;
  },

  // random Sort
  randomSort (array) {
    let currentIndex = array.length,  randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]
      ];
    }

    return array;
  },

  // get images list
  getImageList () {
    var imageList = [];
    try {
      log(`Read Image Path from ${  this.imagePath  }...`);
      var FileList = fs.readdirSync(path = this.imagePath);
    } catch (e) {
      console.log("[SELFIESVIEWER] hey! EXT-Selfies is not installed!");
      return [];
    }
    log("Result:" , FileList);

    if (FileList.length) {
      var ImageList = [];
      log("Check valid picture...");
      FileList.forEach((file) => {
        var isValidImageFileExtension = this.checkValidImageFileExtension(file);
        if (isValidImageFileExtension) ImageList.push(file);
      });
      log("Result:", ImageList);
      if (this.config.sortBy === "random") {
        log("Random Sort selected...");
        ImageList = this.randomSort(ImageList);
      } else {
        log(`${this.config.sortBy  } Sort selected...`);
        ImageList = ImageList.sort(this.sortByFilename);
      }
      imageList = imageList.concat(ImageList);
      log("Final Result:", imageList);
    }
    return imageList;
  },

  // check if it's an valid image 'jpg' file extension
  checkValidImageFileExtension (filename) {
    var found = false;
    if (filename.toLowerCase().endsWith("jpg")) found = true;
    if (filename.toLowerCase().endsWith("jpeg")) found = true;
    return found;
  }
});
