import { Handler, Callback } from 'aws-lambda';
import { parse } from 'querystring';

import { S3 } from 'aws-sdk';
import Sharp from 'sharp';

const s3 = new S3({ signatureVersion: 'v4' });

const handler: Handler<any, Callback> = (event, context, callback) => {
  if (INFO_LOG) console.info('RUNNING ORIGIN-RESPONSE HANDLER');
  const { response } = event.Records[0].cf;

  console.info(response, response.status);

  // eslint-disable-next-line eqeqeq
  if (response.status == 404 || response.status == 403) {
    const { request } = event.Records[0].cf;
    let dimensionParam = parse(request.querystring).d;
    if (!dimensionParam) {
      callback(null, response);
      return;
    }
    dimensionParam = dimensionParam.toString();

    const path = decodeURI(request.uri);
    const key = `${path.substring(1)}`;

    if (INFO_LOG) {
      console.info(`dimension: ${dimensionParam}, path: ${path}, key: ${key}`);
    }

    let prefix;
    let originalKey;
    let match;
    let width: number;
    let height: number;
    let requiredFormat;
    let imageName;

    try {
      match = key.match(/(.*)\/(\d+)x(\d+)\/(.*)\/(.*)/);
      prefix = match[1];
      width = parseInt(match[2], 10);
      height = parseInt(match[3], 10);
      // correction for jpg required for 'Sharp'
      requiredFormat = match[4] === 'jpg' ? 'jpeg' : match[4];
      imageName = match[5];
      originalKey = `${prefix}/${imageName}`;
    } catch (e) {
      // no prefix exists for image
      match = key.match(/(\d+)x(\d+)\/(.*)\/(.*)/);
      width = parseInt(match[1], 10);
      height = parseInt(match[2], 10);
      // correction for jpg required for 'Sharp'
      requiredFormat = match[3] === 'jpg' ? 'jpeg' : match[3];
      imageName = match[4];
      originalKey = imageName;
    }

    if (INFO_LOG) {
      console.info(
        `match: ${match}, prefix: ${prefix}, width: ${width}, height: ${height}, reqFormat: ${requiredFormat}, imageName: ${imageName}, originalKey: ${originalKey}`,
      );
    }

    // get the source image file
    s3.getObject({ Bucket: BUCKET, Key: originalKey })
      .promise()
      // perform the resize operation
      .then((data: any) =>
        Sharp(data.Body)
          .resize(width, height)
          .toFormat(requiredFormat)
          .toBuffer(),
      )
      .then((buffer) => {
        // save the resized object to S3 bucket with appropriate object key.
        s3.putObject({
          Body: buffer,
          Bucket: BUCKET,
          ContentType: `image/${requiredFormat}`,
          CacheControl: 'max-age=31536000',
          Key: key,
          StorageClass: 'STANDARD',
        })
          .promise()
          // even if there is exception in saving the object we send back the generated
          // image back to viewer below
          .catch(() => {
            console.error('Exception while writing resized image to bucket');
          });

        // generate a binary response with resized image
        response.status = 200;
        response.body = buffer.toString('base64');
        response.bodyEncoding = 'base64';
        response.headers['content-type'] = [
          { key: 'Content-Type', value: `image/${requiredFormat}` },
        ];
        callback(null, response);
      })
      .catch((err) => {
        console.error(`Exception while reading source image: ${err}`);
      });
  } // end of if block checking response statusCode
  else {
    // allow the response to pass through
    callback(null, response);
  }
};

export default handler;
