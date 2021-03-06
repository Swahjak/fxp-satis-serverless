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
const path = require('path');
const fs = require('fs-extra');
const program = require('commander');
const AWS = require('aws-sdk');
const archiver = require('./utils/archiver');
const utils = require('./utils/utils');

const AWS_PATH = './aws';
const AWS_CLOUDFORMATION_PATH = AWS_PATH + '/cloud-formation-stack.yaml';
const CONTENT_PATH = './dist';
const BUILD_PATH = './builds';
const BUILD_ARCHIVE_PATH = BUILD_PATH + '/package-lambda.zip';
const BUILD_CLOUDFORMATION_PATH = BUILD_PATH + '/package-stack.yaml';

let s3Keys = {};

program
    .description('Package the built project in S3 for AWS Cloud Formation (build the project before)')
    .option('-f, --force', 'Force to rebuild the project', false)
    .option('-p, --force-package', 'Force to rebuild the package only', false)
    .option('-b, --bucket [bucket]', 'Bucket name')
    .option('-t, --tag [tag]', 'Version tag name of package')
    .parse(process.argv);

utils.spawn('node bin/build' + (program.force ? ' --force' : ''))
    .then(() => {
        console.info('Packaging of the project has started...');

        if (!program.forcePackage && !program.force && fs.existsSync(BUILD_PATH)) {
            console.info('Project is already packaged. Use the "--force" or "--force-package" options to repackage the project');
            return;
        }

        (new Promise((resolve, reject) => {
            try {
                utils.removeDir(BUILD_PATH);
                fs.ensureDirSync(BUILD_PATH);
                resolve();
            } catch (e) {
                reject(e);
            }
        }))
        // Lambda package
        .then(() => archiver.archive(CONTENT_PATH, BUILD_ARCHIVE_PATH))
        .then((archivePath) => utils.checksumFile(archivePath))
        .then((hash) => {
            let newPath = path.join(path.dirname(BUILD_ARCHIVE_PATH), (program.tag ? program.tag : hash) + '.zip');
            fs.renameSync(BUILD_ARCHIVE_PATH, newPath);

            return newPath;
        })
        .then(async (filePath) => {
            let s3 = new AWS.S3({apiVersion: '2006-03-01', region: process.env.AWS_REGION});
            let fileStream = fs.createReadStream(filePath);
            fileStream.on('error', utils.displayError);

            let params = {
                ACL: program.tag ? 'public-read' : undefined,
                Bucket: program.bucket ? program.bucket : process.env.AWS_S3_BUCKET_DEPLOY,
                Key: utils.fixWinSlash(filePath).replace(/\/$/g, ''),
                Body: fileStream
            };
            await s3.upload(params).promise();

            return params.Key;
        })
        .then((key) => {
            s3Keys['S3_LAMBDA_CODE_URI'] = 's3://' + (program.bucket ? program.bucket : process.env.AWS_S3_BUCKET_DEPLOY) + '/' + key;
        })

        // Cloud Formation stack
        .then(async () => {
            let data = fs.readFileSync(AWS_CLOUDFORMATION_PATH, 'utf8');
            data = utils.replaceVariables(data, s3Keys);

            fs.writeFileSync(BUILD_CLOUDFORMATION_PATH, data);

            if (program.tag) {
                let s3 = new AWS.S3({apiVersion: '2006-03-01', region: process.env.AWS_REGION});
                let fileStream = fs.createReadStream(BUILD_CLOUDFORMATION_PATH);
                fileStream.on('error', utils.displayError);

                let params = {
                    ACL: program.tag ? 'public-read' : undefined,
                    Bucket: program.bucket ? program.bucket : process.env.AWS_S3_BUCKET_DEPLOY,
                    Key: `${program.tag}.template`,
                    Body: fileStream
                };
                await s3.upload(params).promise();
            }

            console.info('Project is packaged successfully');
        })

        // Errors
        .catch(utils.displayError);
    })
    .catch(utils.displayError);
