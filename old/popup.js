var overlay = document.querySelector('.overlay');

/* holds a list of {shortcut, url} objects */
var dataset = [];

var in_settings = false;
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
}

function removeFromDataset(shortcut) {
  for (var i = 0; i < dataset.length; i++) {
    if (dataset[i].shortcut == shortcut) {
      dataset.splice(i, 1);
      console.log('Spliced');
    }
  }
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

function openSettings(event) {
  $('#search-box').hide();
  $('#settings-menu').show();
  in_settings = true;

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
  $('.typeahead').focus();
  $('.settings').click(openSettings);

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
  });
});

function closeSettingsUI() {
  in_settings = false;
  $('#settings-menu').hide();
  $('#search-box').show();
  $('.typeahead').focus();
}

$(document).keyup(function(e) {
  if (e.which == 27) {
    if (in_settings) {
      closeSettingsUI();
    } else {
      chrome.runtime.sendMessage('hide_popup');
    }
  }
});

overlay.addEventListener('click', function() {
  console.log('Hiding!!!');
  chrome.runtime.sendMessage('hide_popup');
});

var substringMatcher = function() {
  return function findMatches(q, cb) {
    var matches, substringRegex;

    // an array that will be populated with substring matches
    matches = [];

    // regex used to determine if a string contains the substring `q`
    substrRegex = new RegExp(q, 'i');

    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    $.each(dataset, function(i, entry) {
      if (substrRegex.test(entry.shortcut)) {
        matches.push(entry);
      }
    });

    cb(matches);
  };
};

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

function render_result(result) {
  return '<div>'+ result.shortcut + '<div class="res_url">' + trim(result.url) + '</div></div>';
};

function display(result) {
  return result.shortcut;
}

var box = $('#search-box .typeahead');
box.typeahead({
  hint: true,
  highlight: true,
  minLength: 1
},
{
  name: 'shortcuts',
  source: substringMatcher(),
  display: display,
  templates: {
    suggestion: render_result
  }
});

box.bind('typeahead:select', function(ev, shortcut) {
  var redirect_url = shortcut.url;
  console.log('Redirecting to ', redirect_url);
  if (!redirect_url.startsWith('http')) {
    redirect_url = 'http://' + redirect_url;
  }

  chrome.runtime.sendMessage({target: redirect_url});
});
