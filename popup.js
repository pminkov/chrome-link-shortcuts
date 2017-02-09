var overlay = document.querySelector('.overlay');

/* holds a list of {shortcut, url} objects */
var dataset = [];

var settings_first_open = true;

function addToDataset(shortcut, url) {
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

function removeFromDataset(shortcut) {
  for (var i = 0; i < dataset.length; i++) {
    if (dataset[i].shortcut == shortcut) {
      dataset.splice(i, 1);
      console.log('Spliced');
    }
  }

  chrome.runtime.sendMessage('refresh_dataset');
}

function showSavedShortcut(shortcut, url) {
  var templ = $('#saved-shortcut-template');
  var instance = $(templ).clone();
  $(instance).attr('id', 'saved-' + shortcut);
  $(instance).find('.shortcut-name').text(shortcut);
  $(instance).find('.shortcut-url').text(trim_to_len(url, 150));
  $(instance).show();
  $(instance).find('button').click(function() {
    chrome.storage.sync.remove(shortcut);
    $(this).closest('tr').remove();
    removeFromDataset(shortcut);
  });
  $('#saved-shortcuts-body').prepend(instance);
}

function openSettings() {
  $('#settings-menu').show();

  if (settings_first_open) {
    settings_first_open = false;

    chrome.storage.sync.get(function(stored) {
      console.log('Stored:', stored);
      for (key in stored) {
        console.log(key, ' -> ', stored[key]);

        showSavedShortcut(key, stored[key]);
      }
    });

    $('#add-shortcut').click(function(ev) {
      ev.preventDefault();
      var shortcut = $('#link-name').val();
      var url = $('#link-url').val();

      if (shortcut && shortcut.length > 0) {
        chrome.storage.sync.set({'petko': 'minkov'});
        var to_store = {}
        to_store[shortcut] = url;
        chrome.storage.sync.set(to_store, function(args) {
          console.log('Saved: ', shortcut, ' ', url);
          console.log(arguments);
          console.log(args);

          dataset.push({
            key: shortcut,
            value: url
          });

          showSavedShortcut(shortcut, url);
          addToDataset(shortcut, url);
        });
      }
    });

    $('#close-menu').click(function(ev) {
      ev.preventDefault();
      closeSettingsUI();
    });
  }
}

$(document).ready(function() {
  console.log('Document ready!');
  chrome.storage.sync.get(function(shortcuts) {
    if (false == $.isEmptyObject(shortcuts)) {
      for (var key in shortcuts) {
        dataset.push({
          shortcut: key,
          url: shortcuts[key]
        });
      }
      console.log(dataset);
    }
    openSettings();
  });
});

function closeSettingsUI() {
  console.log('Closing settings UI');
  // This goes to background.js and is then transmitted back
  // to content.js. popup.js is a part of content.js so content.js
  // isn't going to receive its messages.
  chrome.runtime.sendMessage('hide_app');
}

$(document).keyup(function(e) {
  if (e.which == 27) {
    closeSettingsUI();
  }
});

overlay.addEventListener('click', function() {
  closeSettingsUI();
});


function trim_to_len(url, len) {
  if (url.length > len) {
    return url.substr(0, len) + '...'
  } else {
    return url
  }
}

function trim(url) {
  return trim_to_len(url, 80);
}

