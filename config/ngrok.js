let ngrokUrl = "";

async function setNgrokUrl(url) {
  ngrokUrl = url;
  return ngrokUrl;
}

function getNgrokUrl() {
  return ngrokUrl;
}

module.exports = { setNgrokUrl, getNgrokUrl };
