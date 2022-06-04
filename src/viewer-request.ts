import { Callback, Handler } from "aws-lambda";
import { parse } from "querystring";

const allowedDimensions: Dimension[] = [
  // 1:1
  { width: 60, height: 60 },
  { width: 120, height: 120 },
  { width: 255, height: 255 },
  { width: 510, height: 510 },
  { width: 540, height: 540 },
  { width: 750, height: 750 },
  { width: 1080, height: 1080 },
  { width: 1200, height: 1200 },
  { width: 1400, height: 1400 },
  // 16:9
  { width: 1920, height: 1080 },
  { width: 1280, height: 720 },
];
const defaultDimension: Dimension = { width: 255, height: 255 };
const variables = {
  allowedDimensions,
  defaultDimension,
  variance: 20,
  webpExtension: 'webp',
};

const handler: Handler<any, Callback> = (event, context, callback) => {
  if (INFO_LOG) {
    console.info('RUNNING VIEWER-REQUEST HANDLER');
  }
  const { request } = event.Records[0].cf;
  const { headers } = request;
  const params = parse(request.querystring);
  let dimensionParam = params.d;
  let fwdUri = request.uri;
  // if no dimension query, we pass the request
  if (!dimensionParam) {
    callback(null, request);
    return;
  }
  dimensionParam = dimensionParam.toString();
  const coverParam = params.cover;

  const dimensionMatch = dimensionParam.split('x');
  let width: number = parseInt(dimensionMatch[0], 10);
  let height: number = parseInt(dimensionMatch[1], 10);

  if (INFO_LOG) {
    console.info(
      `dimMatch: ${dimensionMatch}, width: ${width}, height: ${height}`,
    );
  }

  const match: string[] = fwdUri.match(/(.*)\/(.*)\.(.*)/);
  const prefix: string = match[1];
  const imageName: string = match[2];
  const extension: string = match[3];

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

  if (INFO_LOG) {
    console.info(
      `match: ${match}, prefix: ${prefix}, imageName: ${imageName}, extension: ${extension}, matchFound: ${matchFound}`,
    );
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
  if (typeof coverParam === 'string') {
    url.push('cover');
  } else {
    // contain is default
    url.push('contain');
  }
  url.push(`${imageName}.${extension}`);

  fwdUri = url.join('/');
  request.uri = fwdUri;

  if (INFO_LOG) {
    console.info(`accept: ${accept}, fwdUri: ${fwdUri}`);
  }

  callback(null, request);
};

export default handler;
