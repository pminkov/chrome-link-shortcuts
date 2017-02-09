console.log('background.js here');

var dataset = [];

chrome.runtime.onMessage.addListener(function(message) {
  if (message == 'hide_app') {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, message);
      }
    });
  }

  if (message == 'refresh_dataset') {
    console.log('Refreshing dataset');
    loadDataset();
  }
});

chrome.browserAction.onClicked.addListener(function() {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    if (tabs.length > 0) {
      chrome.tabs.sendMessage(tabs[0].id, 'show_app');
    }
  });
});

function loadDataset() {
  dataset = []
  chrome.storage.sync.get(function(shortcuts) {
    var count = 0;
    for (var key in shortcuts) {
      count++;
      dataset.push({
        shortcut: key,
        url: shortcuts[key]
      });
    }
    console.log('Loaded a dataset of ', count, ' elements');
  });
}

function xmlEscape(ss) {
  return ss.replace(/&/g, '&amp;')
           .replace(/</g, '&lt;')
           .replace(/>/g, '&gt;')
           .replace(/"/g, '&quot;')
           .replace(/'/g, '&apos;');
}

function urlForShortcut(shortcut) {
  for (var i = 0; i < dataset.length; i++)
    if (dataset[i].shortcut == shortcut)
      return dataset[i].url;
}

function getMatches(text) {
  substrRegex = new RegExp(text, 'i');

  var results = []

  for (var i = 0; i < dataset.length; i++) {
    if (substrRegex.test(dataset[i].shortcut)) {
      results.push(dataset[i]);
    }
  }

  return results;
}

function match(text) {
  substrRegex = new RegExp(text, 'i');

  var matches = getMatches(text);

  var results = [];
  for (var i = 0; i < matches.length; i++) {
    var match = matches[i];
    var res = {};
    res.content = 'go ' + match.shortcut;
    res.description = '';
    res.description += '<match>' + xmlEscape(match.shortcut) + '</match> ';
    res.description += '<url>' + xmlEscape(match.url) + '</url>';

    results.push(res);
  }

  console.log(results);

  if (results.length >= 1) {
    chrome.omnibox.setDefaultSuggestion({
      description: results[0].description
    });
    results.shift();
  } else {
    console.log('new defa');
    chrome.omnibox.setDefaultSuggestion({description: 'No shortcut results'});
  }

  return results;
}

function redirectTo(url) {
  if (!url.startsWith('http')) {
    url += 'http://';
  }
  chrome.tabs.update({'url': url});
}

chrome.omnibox.onInputEntered.addListener(function (text, disposition) {
  console.log(text, ' ' , disposition);
  if (text.startsWith("go ")) {
    var shortcut = text.substr(3);
    redirectTo(urlForShortcut(shortcut));
  } else {
    var matches = getMatches(text);
    redirectTo(matches[0].url);
  }
});


chrome.omnibox.onInputChanged.addListener(function (text, suggest) {
  console.log('matching', text);
  matches = match(text);
  if (matches.length > 0) {
    suggest(matches);
  }
});

