/*
 * This file is part of the Fxp Satis Serverless package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {Constraint} from '@app/db/constraints/Constraint';
import {Query} from '@app/db/constraints/Query';
import {Database} from '@app/db/Database';
import {DatabaseRepository} from '@app/db/repositories/DatabaseRepository';
import {Results} from '@app/db/Results';
import {criteriaToQuery} from '@app/utils/dynamodb';
import {LooseObject} from '@app/utils/LooseObject';

/**
 * @author François Pluchino <francois.pluchino@gmail.com>
 */
export class BaseDatabaseRepository implements DatabaseRepository
{
    private client: Database;

    private readonly prefix?: string;

    /**
     * Constructor.
     *
     * @param {Database} client   The database client
     * @param {string}   [prefix] The id prefix
     */
    constructor(client: Database, prefix?: string) {
        this.client = client;
        this.prefix = prefix;
    }

    /**
     * @inheritDoc
     */
    public async has(id: string): Promise<boolean> {
        return this.client.has(this.getPrefixedId(id));
    }

    /**
     * @inheritDoc
     */
    public async get(id: string): Promise<LooseObject|null> {
        return this.cleanPrefix(await this.client.get(this.getPrefixedId(id)));
    }

    /**
     * @inheritDoc
     */
    public async put(data: LooseObject): Promise<LooseObject> {
        if (data.id) {
            data.id = this.getPrefixedId(data.id);
        }

        if (this.prefix) {
            data.model = this.prefix;
        }

        return this.cleanPrefix(await this.client.put(data));
    }

    /**
     * @inheritDoc
     */
    public async delete(id: string): Promise<string> {
        return this.cleanPrefix(await this.client.delete(this.getPrefixedId(id)));
    }

    /**
     * @inheritDoc
     */
    public async deletes(ids: string[]): Promise<Array<string>> {
        for (let i = 0; i < ids.length; ++i) {
            ids[i] = this.getPrefixedId(ids[i]);
        }

        ids = await this.client.deletes(ids);

        for (let i = 0; i < ids.length; ++i) {
            ids[i] = this.cleanPrefix(ids[i]);
        }

        return ids;
    }

    /**
     * @inheritDoc
     */
    public async find(criteria: Query|LooseObject, startId?: string): Promise<Results> {
        let res = await this.client.find(this.prepareCriteria(criteria), startId ? this.getPrefixedId(startId) : undefined);

        for (let item of res.getRows()) {
            this.cleanPrefix(item);
        }

        return new Results(res.getRows(), res.getCount(), this.cleanPrefix(res.getLastId()));
    }

    /**
     * @inheritDoc
     */
    public async findOne(criteria: Query|LooseObject): Promise<LooseObject> {
        return this.cleanPrefix(await this.client.findOne(this.prepareCriteria(criteria)));
    }

    /**
     * @inheritDoc
     */
    public async search(criteria: Query|LooseObject, fields: string[], search?: string, startId?: string): Promise<Results> {
        let res = await this.client.search(this.prepareCriteria(criteria), fields, search, startId ? this.getPrefixedId(startId) : undefined);

        for (let item of res.getRows()) {
            this.cleanPrefix(item);
        }

        return new Results(res.getRows(), res.getCount(), this.cleanPrefix(res.getLastId()));
    }

    /**
     * @inheritDoc
     */
    public prepareCriteria(criteria: Query|LooseObject): Query {
        let query = criteriaToQuery(criteria);
        query.setModel(this.prefix ? this.prefix : null);
        query.setConstraint(this.prefixConstraint(query.getConstraint()));

        return query;
    }

    /**
     * Prefix the id of constraint.
     *
     * @param {Constraint} constraint
     *
     * @return {Constraint}
     */
    protected prefixConstraint(constraint: Constraint): Constraint {
        let val = constraint.getValue();

        if ('id' === constraint.getKey()) {
            let values = constraint.getValues();

            if (typeof val === 'string') {
                constraint.setValue(this.getPrefixedId(val));
            }

            if (values['id'] && typeof values['id'] === 'string') {
                values['id'] = this.getPrefixedId(values['id']);
            }
        } else if (val instanceof Constraint) {
            this.prefixConstraint(val);
        } else if (Array.isArray(val)) {
            for (let i = 0; i < val.length; ++i) {
                if (val[i] instanceof Constraint) {
                    this.prefixConstraint(val[i]);
                }
            }
        }

        return constraint;
    }

    /**
     * @inheritDoc
     */
    public getPrefixedId(id: string): string {
        return this.prefix ? this.prefix + ':' + id : id;
    }

    /**
     * @inheritDoc
     */
    public cleanPrefix(data: any): any {
        if (this.prefix && null !== data && typeof data === 'object' && data.id && typeof data.id === 'string') {
            data.id = data.id.replace(new RegExp('^' + this.prefix + ':', 'g'), '');
            delete data.model;
        } else if (typeof data === 'string') {
            data = data.replace(new RegExp('^' + this.prefix + ':', 'g'), '');
        }

        return data;
    }
}
