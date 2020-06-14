#!/bin/sh

# for both functions you should get this output if everything is ok: [Function: handler]

cd ./dist/origin-response
node -e "console.info(require('./index').default)"
cd ../viewer-request
node -e "console.info(require('./index').default)"
cd ../..