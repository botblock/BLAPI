const https = require('https');

module.exports = {
    //custom made post function
    post: async (domain, apiPath, apiKey, sendObj) => {
        let postData = JSON.stringify(sendObj);
        let options = {
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
        let req = https.request(options, () => { });
        req.on('error', (e) => {
            console.error(e);
        });
        req.write(postData);
        req.end();
    },
    //custom made get function
    get: async (url) => {
        return new Promise((resolve, reject) => {
            https.get(url, (resp) => {
                let data = '';
                resp.on('data', (chunk) => {
                    data += chunk;
                });
                resp.on('end', () => {
                    resolve(JSON.parse(data));
                });
                resp.on('error', (e) => {
                    console.error(e);
                    reject(`Request to ${resp.url} failed with HTTP ${resp.status}`);
                });
            })
        })
    }
}


