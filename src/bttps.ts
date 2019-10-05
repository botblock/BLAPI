import fetch from "node-fetch";

/** Custom post function based on node-fetch */
export async function post(
  apiPath: string,
  apiKey: string,
  sendObj: object,
  logStuff: boolean
) {
  const postData = JSON.stringify(sendObj);
  try {
    const response = await fetch(apiPath, {
      method: "POST",
      body: postData,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": String(postData.length),
        Authorization: apiKey
      }
    });

    if (logStuff) {
      console.log("BLAPI: posted to", apiPath);
      console.log("BLAPI: statusCode:", response.status, response.statusText);
      console.log("BLAPI: headers:", response.headers.raw());
    }

    // it's text because text accepts both json and plain text, while json only supports json
    return console.log("BLAPI: data:", response.text());
  } catch (e) {
    console.error("BLAPI:", e);
    throw new Error(`Request to ${apiPath} failed with ${e}`);
  }
}
/** Custom get function based on node-fetch*/
export async function get(url: string) {
  try {
    const response = await fetch(url);
    return response.json();
  } catch (e) {
    console.error("BLAPI:", e);
    throw new Error(`Request to ${url} failed with Errorcode ${e}`);
  }
}
