#!/bin/sh

DOCKER_IMAGE='amazonlinux:nodejs'

# build origin-response function
docker run --rm --volume ${PWD}/dist/origin-response:/build ${DOCKER_IMAGE} /bin/bash -c "source ~/.bashrc; npm init -f -y; npm install aws-sdk sharp querystring --save; npm install --only=prod"
mkdir -p dist/package && cd dist/origin-response && zip -FS -q -x \*.iml -r ../package/origin-response.zip * && cd ../..

# build view-request function
docker run --rm --volume ${PWD}/dist/viewer-request:/build ${DOCKER_IMAGE} /bin/bash -c "source ~/.bashrc; npm init -f -y; npm install querystring --save; npm install --only=prod"
mkdir -p dist/package && cd dist/viewer-request && zip -FS -q -x \*.iml -r ../package/viewer-request.zip * && cd ../..