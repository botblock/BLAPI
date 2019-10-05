const fetch = require("node-fetch")

module.exports = {
  // custom made post function
  post: (apiPath, apiKey, sendObj, logStuff) => new Promise((resolve, reject) => {
    const postData = JSON.stringify(sendObj);

    fetch(apiPath, {
      method: 'POST',
      body: postData,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length,
        'Authorization': apiKey
      }
    }).then(res => {
      if (logStuff) {
        console.log('BLAPI: posted to', apiPath);
        console.log('BLAPI: statusCode:', res.status, res.statusText);
        console.log('BLAPI: headers:', res.headers.raw())
      }
      return res.text(); // it's text because text accepts both json and plain text, while json only supports json
    }).then(body => resolve(console.log('BLAPI: data:', body))).catch(e => {
      console.error('BLAPI:', e);
      reject(new Error(`Request to ${req.url} failed with Errorcode ${req.status}:\n${req.statusText}`));
    })
  }),
  // custom made get function
  get: url => new Promise((resolve, reject) => {
    fetch(url).then(res => res.json()).then(resolve).catch(e => {
      console.error('BLAPI:', e);
      reject(new Error(`Request to ${resp.url} failed with Errorcode ${resp.status}:\n${resp.statusText}`));
    })
  })
};
