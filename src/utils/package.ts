/*
 * This file is part of the Fxp Satis Serverless package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {Package} from '@app/composer/packages/Package';
import {In} from '@app/db/constraints/In';
import {Not} from '@app/db/constraints/Not';
import {PackageRepository} from '@app/db/repositories/PackageRepository';
import {LooseObject} from '@app/utils/LooseObject';

/**
 * Retrieves all package versions.
 *
 * @param {string}            packageName The package name
 * @param {PackageRepository} packageRepo The database repository of composer repository
 * @param {Object}            packages    The packages
 * @param {string}           [lastId]     The last id of previous request
 *
 * @return {Promise<Object<string, Package>>}
 */
export async function retrieveAllVersions(packageName: string, packageRepo: PackageRepository, packages: LooseObject, lastId?: string): Promise<LooseObject> {
    let versionNames = Object.keys(packages);
    let criteria: LooseObject = {name: packageName};

    if (versionNames.length > 0) {
        criteria.version = new Not(new In('version', versionNames));
    }

    let res = await packageRepo.find(criteria, lastId);

    for (let packageData of res.getRows()) {
        let pack = new Package(packageData);
        packages[pack.getVersion()] = pack;
    }

    if (res.hasLastId()) {
        packages = retrieveAllVersions(packageName, packageRepo, packages, res.getLastId());
    }

    return packages;
}
