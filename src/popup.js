var overlay = document.querySelector('.overlay');

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
    $(me).closest('tr').remove();
    // todo: implement.
    chrome.runtime.sendMessage({
      code: REMOVE_SHORTCUT,
      shortcut: shortcut
    });
  });
  $('#saved-shortcuts-body').prepend(instance);
}

function openSettings(links) {
  $('#settings-menu').show();
  var hash = window.location.hash;
  if (hash == '') {
    $('#link-url').focus();
  } else {
    $('#link-url').val(decodeURI(window.location.hash.substr(1)));
    $('#link-name').focus();
  }

  if (settings_first_open) {
    settings_first_open = false;

    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      showSavedShortcut(link.shortcut, link.url);
    };

    $('#add-shortcut').click(function(ev) {
      ev.preventDefault();
      var shortcut = $('#link-name').val();
      var url = $('#link-url').val();

      if (shortcut && shortcut.length > 0) {
        if (!url.startsWith('http')) {
          url = 'http://' + url;
        }
        chrome.runtime.sendMessage({
          code: ADD_TO_DATASET,
          shortcut: shortcut,
          url: url
        });
        showSavedShortcut(shortcut, url);
      }
    });

    $('#close-menu').click(function(ev) {
      ev.preventDefault();
      closeSettingsUI();
    });
  }
}

$(document).ready(function() {
  chrome.runtime.sendMessage(GET_DATASET, function(links) {
    openSettings(links);
  });
});

function closeSettingsUI() {
  // This goes to background.js and is then transmitted back
  // to content.js. popup.js is a part of content.js so content.js
  // isn't going to receive its messages.
  chrome.runtime.sendMessage(HIDE_APP);
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

