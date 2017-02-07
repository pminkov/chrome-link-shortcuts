console.log('background.js here');

chrome.browserAction.setBadgeText({text: '6'});

chrome.commands.onCommand.addListener(function (command) {
  console.log('Command:', command);
  if (command === "go") {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, 'show_choice');
      }
    });
    //chrome.tabs.update({url: 'http://pminkov.github.io/category/linux.html'});
  } 
});


chrome.runtime.onMessage.addListener(function(message, sender) {
  console.log('BG: Received message', message);
  chrome.tabs.sendMessage(sender.tab.id, message);
  if (message.target) {
    chrome.tabs.update(sender.tab.id, {url: message.target});
  }
});

