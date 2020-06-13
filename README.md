# Cloudfront Lambda Image Resizing

I directly followed this, but using Typescript and my own preferences: [https://aws.amazon.com/ko/blogs/networking-and-content-delivery/resizing-images-with-amazon-cloudfront-lambdaedge-aws-cdn-blog/]

I already had S3 + Cloudfront setup before doing this so your setup might be a bit different.

Do this (in this order) to create zip packages for the functions:

* create an .env file in the root with the variable BUCKET (your S3 image bucket, for example 'image-resize-${AWS::AccountId}-us-east-1')

* `npm run build`

* `docker build --tag amazonlinux:nodejs .`

* `sudo bash build.sh`