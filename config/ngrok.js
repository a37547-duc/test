let ngrokUrl = "";

function setNgrokUrl(url) {
  ngrokUrl = url;
}

function getNgrokUrl() {
  return ngrokUrl;
}

module.exports = { setNgrokUrl, getNgrokUrl };
