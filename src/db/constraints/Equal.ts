/*
 * This file is part of the Fxp Satis Serverless package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {Constraint} from '@app/db/constraints/Constraint';

/**
 * @author François Pluchino <francois.pluchino@gmail.com>
 */
export class Equal<V> extends Constraint<V>
{
    /**
     * Constructor.
     *
     * @param {string} key   The key
     * @param {any}    value The value
     */
    constructor(key: string, value: any) {
        super('=', key, value);
    }
}
