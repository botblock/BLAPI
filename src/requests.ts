import c from 'centra';

export type UserLogger = {
  info: (msg: string) => void;
  warn: (msg: string) => void;
  error: (msg: string) => void;
};

/** Custom post function based on centra */
export async function post(
  apiPath: string,
  apiKey: string,
  sendObj: object,
  logger: UserLogger,
) {
  const postData = JSON.stringify(sendObj);
  try {
    const request = c(apiPath, 'POST');
    request.reqHeaders = {
      'Content-Type': 'application/json',
      'Content-Length': String(postData.length),
      Authorization: apiKey,
    };
    const response = await request.body(postData).send();

    logger.info(` posted to ${apiPath}`);
    logger.info(` statusCode: ${response.statusCode}`);
    logger.info(` headers: ${JSON.stringify(response.headers)}`);
    // it's text because text accepts both json and plain text, while json only supports json
    logger.info(` data: ${await response.text()}`);

    return response;
  } catch (e) {
    const error = e as Error;
    logger.error(error.message);
    return { error };
  }
}
/** Custom get function based on centra */
export async function get<T>(url: string, logger: UserLogger): Promise<T> {
  try {
    const response = await c(url, 'GET').send();
    return response.json();
  } catch (e) {
    const error = e as Error;
    logger.error(error.message);
    throw new Error(`Request to ${url} failed with Errorcode ${error.name}`);
  }
}
