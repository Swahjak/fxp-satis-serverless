/*
 * This file is part of the Fxp Satis Serverless package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {Database} from '@app/db/Database';
import {BaseDatabaseRepository} from '@app/db/repositories/BaseDatabaseRepository';

/**
 * @author François Pluchino <francois.pluchino@gmail.com>
 */
export class PackageRepository extends BaseDatabaseRepository
{
    /**
     * Constructor.
     *
     * @param {Database} client The database client
     */
    constructor(client: Database) {
        super(client, 'packages');
    }

    /**
     * @inheritDoc
     */
    public static getName(): string {
        return 'Package';
    }
}
