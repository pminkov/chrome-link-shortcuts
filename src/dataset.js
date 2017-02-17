function Dataset() {
  this.links = [];
  this.bookmark_utils = new BookmarkUtils();
  this.loaded = false;
}

Dataset.prototype.load = function(callback) {
  var me = this;

  if (me.loaded) {
    console.log('Links are already lodaded.');
    callback(me.links);
  } else {
    me.bookmark_utils.getLinkShortcutsFolderId(function(folder_id, just_created) {
      console.log('Shortcuts folder:', folder_id, just_created);
      if (just_created) {
        console.log('Copying from storage.sync');
        // Copy from storage.
        // TODO(petko): Remove in a week.
        chrome.storage.sync.get(function(links) {
          me.bookmark_utils.insertLinksIntoFolder(folder_id, links);
        });
      } 

      me.bookmark_utils.getShortcuts(folder_id, function(links) {
        console.log('Loaded', links.length, 'links');
        me.links = links;
        me.loaded = true;
        if (callback) {
          callback(links);
        }
      });
    });
  }
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

Dataset.prototype.addToDataset = function(shortcut, url, callback) {
  this.bookmark_utils.addBookmark(shortcut, url);

  // Push in local representation.
  var new_entry = {
    shortcut: shortcut,
    url: url
  };
  this.links.push(new_entry);
}

Dataset.prototype.removeFromDataset = function(shortcut) {
  for (var i = 0; i < dataset.length; i++) {
    if (dataset[i].shortcut == shortcut) {
      dataset.splice(i, 1);
      console.log('Spliced');
    }
  }

  this.bookmark_utils.removeBookmark(shortcut);
}

