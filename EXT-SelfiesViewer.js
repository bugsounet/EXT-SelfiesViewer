/**************************
*  EXT-SelfiesViewer v1.0 *
*  Bugsounet              *
*  11/2022                *
***************************/

Module.register("EXT-SelfiesViewer", {
  defaults: {
    debug: false,
    moduleWidth: 300,
    moduleHeight: 250,
    displayDelay: 1000 * 10,
    displayBackground: true,
    sortBy: "new" // old or random
  },

  start: function () {
    this.viewer= {
      index: 0,
      imageList: [],
      timer: null
    }
    var sort = ["new", "old", "random"]
    if (sort.indexOf(this.config.sortBy) == -1) this.config.sortBy = "new"
    this.imagePath= 'modules/EXT-Selfies/photos/'
  },

  getDom: function() {
    var selfies = document.createElement("div")
    selfies.id = "EXT_SELFIESVIEWER"
    selfies.style.height= this.config.moduleHeight + "px"
    selfies.style.width= this.config.moduleWidth + "px"
    var selfiesBack = document.createElement("div")
    selfiesBack.id = "EXT_SELFIESVIEWER_BACK"
    var selfiesCurrent = document.createElement("div")
    selfiesCurrent.id = "EXT_SELFIESVIEWER_CURRENT"
    selfiesCurrent.style.backgroundImage = `url(modules/EXT-SelfiesViewer/resources/coming_soon.png)`
    selfiesCurrent.classList.add("animated")
    selfiesCurrent.addEventListener('animationend', ()=>{
      selfiesCurrent.classList.remove("animated")
    })

    selfies.appendChild(selfiesBack)
    selfies.appendChild(selfiesCurrent)
    return selfies
  },

  getStyles: function() {
    return ["EXT-SelfiesViewer.css"]
  },

  socketNotificationReceived: function(noti, payload) {
    switch(noti) {
      case "EMPTY":
        this.viewer.imageList = []
        clearInterval(this.viewer.timer)
        this.viewer.timer = null
        this.updateDom()
        break
      case "LIST":
        clearInterval(this.viewer.timer)
        this.viewer.timer = null
        this.viewer.imageList = payload
        this.viewer.index = 0
        this.displaySelfies()
        if (this.viewer.imageList.length > 1) {
          this.viewer.timer = setInterval(()=>{
            this.viewer.index++
            this.displaySelfies()
          }, this.config.displayDelay)
        }
        break
    }
  },

  notificationReceived: function(noti, payload, sender) {
    switch(noti) {
      case "GA_READY":
        if (sender.name == "MMM-GoogleAssistant") {
          this.sendSocketNotification('INIT', this.config)
          this.ready= true
          this.sendNotification("EXT_HELLO", this.name)
        }
        break
      case "EXT_SELFIES-CLEAN_STORE":
      case "EXT_SELFIES-RESULT":
        if (this.ready) this.sendSocketNotification("SCAN")
        break
    }
  },

  displaySelfies: function () {
    if (this.viewer.index < 0) this.viewer.index = 0
    if (this.viewer.index >= this.viewer.imageList.length) this.viewer.index = 0
    let filename = this.viewer.imageList[this.viewer.index]
    let url = this.imagePath + filename
    this.displayCurrentSelfie(url)
  },

  displayCurrentSelfie: function(url) {
    var hidden = document.createElement("img")
    hidden.onerror = () => {
      console.error("[SELFIESVIWER] Failed to Load Image:", url)
    }
    hidden.onload = () => {
      var back = document.getElementById("EXT_SELFIESVIEWER_BACK")
      var current = document.getElementById("EXT_SELFIESVIEWER_CURRENT")
      if (this.config.displayBackground) back.style.backgroundImage = `url(${url})`
      current.style.backgroundImage = `url(${url})`
      current.classList.add("animated")
    }
    hidden.src = url
  }
})
