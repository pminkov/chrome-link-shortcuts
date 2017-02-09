console.log('hi there - content3');

var iframe = document.createElement('iframe');
iframe.className = 'css-isolation-popup';
iframe.frameBorder = 0;
iframe.style.display = 'none';
document.body.appendChild(iframe);

chrome.runtime.onMessage.addListener(function(message) {
  console.log('message=', message);
  if (message == 'hide_popup') {
    iframe.style.display = 'none';
  }
  if (message == 'show_choice') {
    // Reload the frame for a fresh start.
    iframe.src = chrome.extension.getURL("popup.html");
    iframe.style.display = 'inline';
  }
});
