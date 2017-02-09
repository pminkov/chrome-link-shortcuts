console.log('hi there - content3');



var iframe = document.createElement('iframe');
iframe.className = 'css-isolation-popup';
iframe.frameBorder = 0;
iframe.style.display = 'none';
document.body.appendChild(iframe);

chrome.runtime.sendMessage('refresh_dataset');

chrome.runtime.onMessage.addListener(function(message) {
  console.log('message=', message);

  if (message == 'hide_app') {
    iframe.style.display = 'none';
  }
  if (message == 'show_app') {
    console.log('im hereeee');
    // Reload the frame for a fresh start.
    iframe.src = chrome.extension.getURL("popup.html");
    iframe.style.display = 'inline';

  }
});
