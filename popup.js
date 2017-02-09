var overlay = document.querySelector('.overlay');

/* holds a list of {shortcut, url} objects */
var dataset = new Dataset();

var settings_first_open = true;

function showSavedShortcut(shortcut, url) {
  var templ = $('#saved-shortcut-template');
  var instance = $(templ).clone();
  $(instance).attr('id', 'saved-' + shortcut);
  $(instance).find('.shortcut-name').text(shortcut);
  $(instance).find('.shortcut-url').text(trim_to_len(url, 150));
  $(instance).show();
  $(instance).find('button').click(function() {
    var me = this;
    dataset.removeFromDataset(shortcut, function() {
      $(me).closest('tr').remove();
    });
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
        dataset.addToDataset(shortcut, url, function() {
          showSavedShortcut(shortcut, url);
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
  dataset.load(function() {
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

