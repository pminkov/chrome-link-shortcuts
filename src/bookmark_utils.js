function BookmarkUtils() {
  this.link_shortcuts_folder_id = null;
  this.initializing = false;
  this.waiting = [];
};

BookmarkUtils.prototype.findChild = function(id, title, callback) {
  chrome.bookmarks.getChildren(id, function(children) {
    var found = false;
    for (var i = 0; i < children.length; i++) {
      if (children[i].title == title) {
        callback(children[i]);
        found = true;
        break;
      }
    }

    if (!found) {
      callback(null);
    }
  });
}

BookmarkUtils.prototype.insertLinksIntoFolder = function(folder_id, links) {
  for (var key in links) {
    var url = links[key];
    if (!url.startsWith('http')) {
      url = 'http://' + url;
    }
    chrome.bookmarks.create({
      parentId: folder_id,
      title: key,
      url: url
    });
  }
}

BookmarkUtils.prototype.getLinkShortcutsFolder = function(callback) {
  var me = this;
  me.findChild("0", "Other Bookmarks", function(other_bookmarks) {
    if (other_bookmarks) {
      me.findChild(other_bookmarks.id, "Link Shortcuts", function(link_shortcuts) {
        callback(other_bookmarks.id, link_shortcuts);
      });
    } else {
      console.log("Surprising. Didn't find 'Other Bookmarks'");
    }
  });
}

BookmarkUtils.prototype.linkShortcutsIdReady = function(folder_id, callback,just_created) {
  this.link_shortcuts_folder_id = folder_id;
  callback(folder_id, just_created);
  for (var i = 0; i < this.waiting.length; i++) {
    this.waiting[i].call(this, folder_id, false);
  }
}

BookmarkUtils.prototype.createLinkShortcutsFolder = function(parentId, callback) {
  chrome.bookmarks.create({
    parentId: parentId,
    title: "Link Shortcuts"
  }, function(created) {
    callback(created);
  });
}

BookmarkUtils.prototype.getLinkShortcutsFolderId = function(callback) {
  var me = this;

  if (me.link_shortcuts_folder_id) {
    callback(me.link_shortcuts_folder_id);
  } else {
    if (me.initializing) {
      console.log("In waiting list for folder id");
      me.waiting.push(callback);
    } else {
      me.initializing = true;
      me.getLinkShortcutsFolder(function(other_bookmarks_id, link_shortcuts) {
        if (!link_shortcuts) {
          console.log("Couldn't find link shortcuts folder. Creating it.");
          me.createLinkShortcutsFolder(other_bookmarks_id, function(links_folder) {
            me.linkShortcutsIdReady(links_folder.id, callback, true);
          });
        } else {
          me.linkShortcutsIdReady(link_shortcuts.id, callback, false);
        }
      });
    }
  }
}

BookmarkUtils.prototype.getShortcuts = function(fid, callback) {
  chrome.bookmarks.getChildren(fid, function(children) {
    var links = []
    for (var i = 0; i < children.length; i++) {
      links.push({
        shortcut: children[i].title,
        url: children[i].url
      });
    }

    callback(links);
  });
}

BookmarkUtils.prototype.addBookmark = function(shortcut, url) {
  this.getLinkShortcutsFolderId(function(fid) {
    chrome.bookmarks.create({
      parentId: fid,
      url: url,
      title: shortcut
    });
  });
}

BookmarkUtils.prototype.removeBookmark = function(shortcut) {
  this.getLinkShortcutsFolderId(function(fid) {
    chrome.bookmarks.getChildren(fid, function(children) {
      for (var i = 0; i < children.length; i++) {
        if (children[i].title == shortcut) {
          chrome.bookmarks.remove(children[i].id);
        }
      }
    });
  });
}


