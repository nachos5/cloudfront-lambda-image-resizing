import { Handler, Callback } from 'aws-lambda';
import { parse } from 'querystring';

import { Dimension } from './types';

const allowedDimensions: Dimension[] = [
  { width: 100, height: 100 },
  { width: 200, height: 200 },
  { width: 300, height: 300 },
  { width: 400, height: 400 },
];
const defaultDimension: Dimension = { width: 200, height: 200 };
const variables = {
  allowedDimensions,
  defaultDimension,
  variance: 20,
  webpExtension: 'webp',
};

const handler: Handler<any, Callback> = (event, context, callback) => {
  const { request } = event.Records[0].cf;
  const { headers } = request;
  const dimensionParam = parse(request.querystring).d.toString();
  let fwdUri = request.uri;

  // if no dimension query, we pass the request
  if (!dimensionParam) {
    callback(null, request);
    return;
  }

  const dimensionMatch = dimensionParam.split('x');
  let width: number = parseInt(dimensionMatch[0], 10);
  let height: number = parseInt(dimensionMatch[1], 10);

  const match = fwdUri.match(/(.*)\/(.*)\.(.*)/);
  const prefix = match[1];
  const imageName = match[2];
  const extension = match[3];

  let matchFound = false;
  for (const dimension of variables.allowedDimensions) {
    if (dimension.width === width && dimension.height === height) {
      matchFound = true;
      break;
    }
  }
  // if we didn't find a match we use the default dimension
  if (!matchFound) {
    width = variables.defaultDimension.width;
    height = variables.defaultDimension.height;
  }

  // we check if we can use webP
  const accept = headers.accept ? headers.accept[0].value : '';
  const url = [];
  url.push(prefix);
  url.push(`${width}x${height}`);
  if (accept.includes(variables.webpExtension)) {
    url.push(variables.webpExtension);
  } else {
    url.push(extension);
  }
  url.push(`${imageName}.${extension}`);

  fwdUri = url.join('/');
  request.uri = fwdUri;
  callback(null, request);
};

export default handler;
