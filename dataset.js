function Dataset() {
  this.links = [];
}

Dataset.prototype.load = function(callback) {
  var me = this;
  me.links = [];
  chrome.storage.sync.get(function(links) {
    var count = 0;
    for (var key in links) {
      count++;
      me.links.push({
        shortcut: key,
        url: links[key]
      });
    }
    console.log('Loaded a dataset of ', count, ' elements');

    if (callback) {
      callback();
    }
  });
}

Dataset.prototype.getMatches = function(text) {
  substrRegex = new RegExp(text, 'i');

  var results = []

  for (var i = 0; i < this.links.length; i++) {
    if (substrRegex.test(this.links[i].shortcut)) {
      results.push(this.links[i]);
    }
  }

  return results;
};

Dataset.prototype.urlForShortcut = function(shortcut) {
  for (var i = 0; i < this.links.length; i++)
    if (this.links[i].shortcut == shortcut)
      return this.links[i].url;
};

Dataset.prototype.addToDataset = function(shortcut, url) {
  var new_entry = {
    shortcut: shortcut,
    url: url
  };
  
  var found = false;
  for (var i = 0; i < dataset.length; i++) {
    if (dataset[i].shortcut == new_entry.shortcut) {
      dataset[i] = new_entry;
      found = true;
    }
  }
  if (!found) {
    dataset.push(new_entry);
  }

  chrome.runtime.sendMessage('refresh_dataset');
}

Dataset.prototype.removeFromDataset = function(shortcut) {
  for (var i = 0; i < dataset.length; i++) {
    if (dataset[i].shortcut == shortcut) {
      dataset.splice(i, 1);
      console.log('Spliced');
    }
  }

  chrome.runtime.sendMessage('refresh_dataset');
}

