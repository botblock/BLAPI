const https = require('https');

module.exports = {
  // custom made post function
  post: (domain, apiPath, apiKey, sendObj, logStuff) => new Promise((resolve, reject) => {
    const postData = JSON.stringify(sendObj);
    const options = {
      hostname: domain,
      port: 443,
      path: apiPath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length,
        'Authorization': apiKey
      }
    };
    const req = https.request(options, res => {
      if (logStuff) {
        console.log(`BLAPI: posted to ${domain}${apiPath}`);
        console.log('BLAPI: statusCode:', res.statusCode);
        console.log('BLAPI: headers:', res.headers);
        res.on('data', d => {
          console.log(`BLAPI: data: ${d}`);
        });
      }
    });
    req.on('error', e => {
      console.error(`BLAPI: ${e}`);
      reject(new Error(`Request to ${req.url} failed with Errorcode ${req.status}:\n${req.statusText}`));
    });
    req.write(postData);
    req.end();
    resolve();
  }),
  // custom made get function
  get: url => new Promise((resolve, reject) => {
    https.get(url, resp => {
      let data = '';
      resp.on('data', chunk => {
        data += chunk;
      });
      resp.on('end', () => {
        resolve(JSON.parse(data));
      });
      resp.on('error', e => {
        console.error(`BLAPI: ${e}`);
        reject(new Error(`Request to ${resp.url} failed with Errorcode ${resp.status}:\n${resp.statusText}`));
      });
    });
  })
};
