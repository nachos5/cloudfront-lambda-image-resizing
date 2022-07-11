import { Callback, Handler } from "aws-lambda";
import { parse } from "querystring";

const allowedDimensions: Dimension[] = [
  // 1:1
  { width: 60, height: 60 },
  { width: 120, height: 120 },
  { width: 255, height: 255 },
  { width: 360, height: 360 },
  { width: 420, height: 420 },
  { width: 510, height: 510 },
  { width: 540, height: 540 },
  { width: 750, height: 750 },
  { width: 1080, height: 1080 },
  { width: 1200, height: 1200 },
  { width: 1400, height: 1400 },
  // 16:9
  { width: 1920, height: 1080 },
  { width: 1440, height: 810 },
  { width: 1280, height: 720 },
];
const defaultDimension: Dimension = { width: 255, height: 255 };
const variables = {
  allowedDimensions,
  defaultDimension,
  variance: 20,
  webpExtension: "webp",
};

const debug = (...args: any[]) => {
  if (INFO_LOG) {
    console.info(...args);
  }
};

const handler: Handler<any, Callback> = (event, context, callback) => {
  debug("RUNNING VIEWER-REQUEST HANDLER");

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
  const insideParam = params.inside;
  const outsideParam = params.outside;

  const dimensionMatch = dimensionParam.split("x");
  let width: number = parseInt(dimensionMatch[0], 10);
  let height: number = parseInt(dimensionMatch[1], 10);

  debug(`dimMatch: ${dimensionMatch}, width: ${width}, height: ${height}`);

  const match: string[] = fwdUri.match(/(.*)\/(.*)\.(.*)/);
  const [_, prefix, imageName, extension] = match;

  const matchFound = variables.allowedDimensions.some(
    (dimension) => dimension.width === width && dimension.height === height
  );
  // if we didn't find a match we use the default dimension
  if (!matchFound) {
    width = variables.defaultDimension.width;
    height = variables.defaultDimension.height;
  }

  debug(
    `match: ${match}, prefix: ${prefix}, imageName: ${imageName}, extension: ${extension}, matchFound: ${matchFound}`
  );

  // we check if we can use webP
  const accept = headers.accept ? headers.accept[0].value : "";
  const url = [
    prefix,
    `${width}x${height}`,
    accept.includes(variables.webpExtension)
      ? variables.webpExtension
      : extension,
  ];
  if (typeof coverParam === "string") {
    url.push("cover");
  } else if (typeof insideParam === "string") {
    url.push("inside");
  } else if (typeof outsideParam === "string") {
    url.push("outside");
  } else {
    // contain is default
    url.push("contain");
  }
  url.push(`${imageName}.${extension}`);
  fwdUri = url.join("/");
  request.uri = fwdUri;

  debug(`accept: ${accept}, fwdUri: ${fwdUri}`);

  callback(null, request);
};

export default handler;
