#!/usr/bin/env node

/*
 * This file is part of the Fxp Satis Serverless package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

require('dotenv').config();
const program = require('commander');
const AWS = require('aws-sdk');
const utils = require('./utils/utils');

program
    .description('Configure the project, create the S3 bucket, package and deploy in AWS Cloud Formation, with API Gateway, Lambda and IAM')
    .parse(process.argv);

utils.spawn('node bin/config')
    .then(async () => {
        let s3 = new AWS.S3({apiVersion: '2006-03-01', region: process.env['AWS_REGION']});

        try {
            await s3.getBucketLocation({Bucket: process.env['AWS_S3_BUCKET_DEPLOY']}).promise();
        } catch (e) {
            return false;
        }

        return true;
    })
    .then((hasBucket) => {
        if (!hasBucket) {
            return utils.spawn('node bin/create-bucket');
        }
    })
    .then(() => utils.spawn('node bin/package-deploy'))
    .catch(utils.displayError);
