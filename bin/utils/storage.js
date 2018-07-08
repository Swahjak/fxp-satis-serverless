/*
 * This file is part of the Fxp Satis Serverless package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const LocalStorage = require('../../src/storages/LocalStorage');
const AwsS3Storage = require('../../src/storages/AwsS3Storage');

/**
 * Create the storage.
 *
 * @param {commander} [program] The commander js
 *
 * @return {DataStorage}
 */
module.exports.createStorage = function createStorage(program) {
    return program && program.local ? new LocalStorage('./var/storage'): new AwsS3Storage(process.env.AWS_S3_BUCKET_DEPLOY, process.env.AWS_REGION);
};
