console.log('background.js here');

// Returned when we're responding asynchronously.
var RESPOND_ASYNC = true;

var dataset = new Dataset();

dataset.load();
dataset.load();

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message == HIDE_APP) {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, message);
      }
    });
  }

  if (message == GET_DATASET) {
    console.log('Got GET_DATASET');
    dataset.load(function(links) {
      sendResponse(links);
    });
    return RESPOND_ASYNC;
  }

  if (message.code) {
    if (message.code == ADD_TO_DATASET) {
      dataset.addToDataset(message.shortcut, message.url);
    }

    if (message.code == REMOVE_SHORTCUT) {
      dataset.removeFromDataset(message.shortcut);
    }
  }
});

chrome.browserAction.onClicked.addListener(function() {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    if (tabs.length > 0) {
      chrome.tabs.sendMessage(tabs[0].id, 'show_app');
    }
  });
});

function xmlEscape(ss) {
  return ss.replace(/&/g, '&amp;')
           .replace(/</g, '&lt;')
           .replace(/>/g, '&gt;')
           .replace(/"/g, '&quot;')
           .replace(/'/g, '&apos;');
}

function match(text) {
  substrRegex = new RegExp(text, 'i');

  var matches = dataset.getMatches(text);

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
    url = 'http://' + url;
  }
  chrome.tabs.update({'url': url});
}

chrome.omnibox.onInputEntered.addListener(function (text, disposition) {
  console.log(text, ' ' , disposition);
  if (text.startsWith("go ")) {
    var shortcut = text.substr(3);
    redirectTo(dataset.urlForShortcut(shortcut));
  } else {
    var matches = dataset.getMatches(text);
    if (matches.length) {
      redirectTo(matches[0].url);
    }
  }
});


chrome.omnibox.onInputChanged.addListener(function (text, suggest) {
  console.log('matching', text);
  matches = match(text);
  if (matches.length > 0) {
    suggest(matches);
  }
});

