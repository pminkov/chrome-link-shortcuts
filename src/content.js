var iframe;

function createIFrame() {
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.className = 'css-isolation-popup';
    iframe.frameBorder = 0;
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
  }
}

chrome.runtime.onMessage.addListener(function(message) {
  if (message == HIDE_APP) {
    iframe.style.display = 'none';
  }
  if (message == 'show_app') {
    createIFrame();
    // Reload the frame for a fresh start.
    var currentUrl = document.location.toString();
    var hash = '';
    if (currentUrl.indexOf("/newtab") == -1) {
      hash = '#' + encodeURI(currentUrl);
    }
    iframe.src = chrome.extension.getURL("popup.html") + hash;
    iframe.style.display = 'inline';
  }
});
