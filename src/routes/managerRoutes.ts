/*
 * This file is part of the Fxp Satis Serverless package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {createApiKey, deleteApiKey} from '@app/controllers/manager/apiKeyController';
import {createGithubOauth, deleteGithubOauth, showGithubOauth} from '@app/controllers/manager/githubOauthController';
import {createGithubToken, deleteGithubToken, showGithubToken} from '@app/controllers/manager/githubTokenController';
import {deletePackages, refreshCachePackages, refreshPackages} from '@app/controllers/manager/packageController';
import {disableRepository, enableRepository, listRepository} from '@app/controllers/manager/repositoryController';
import {Authenticate} from '@app/middlewares/auth/Authenticate';
import {AuthStrategy} from '@app/middlewares/auth/strategies/AuthStrategy';
import {asyncHandler} from '@app/utils/handler';
import {Router} from 'express';

/**
 * Generate the routes.
 *
 * @param {Router}       router            The router
 * @param {AuthStrategy} basicAuthStrategy The auth strategy
 *
 * @return {Router}
 */
export function managerRoutes(router: Router, basicAuthStrategy: AuthStrategy): Router {
    router.use(asyncHandler(Authenticate.middleware(basicAuthStrategy)));

    router.post('/api-keys', asyncHandler(createApiKey));
    router.delete('/api-keys', asyncHandler(deleteApiKey));

    router.post('/github-oauth', asyncHandler(createGithubOauth));
    router.get('/github-oauth', asyncHandler(showGithubOauth));
    router.delete('/github-oauth', asyncHandler(deleteGithubOauth));

    router.post('/github-token', asyncHandler(createGithubToken));
    router.get('/github-token', asyncHandler(showGithubToken));
    router.delete('/github-token', asyncHandler(deleteGithubToken));

    router.get('/repositories', asyncHandler(listRepository));
    router.post('/repositories', asyncHandler(enableRepository));
    router.delete('/repositories', asyncHandler(disableRepository));

    router.put('/packages/refresh', asyncHandler(refreshPackages));
    router.put('/packages/refresh-all', asyncHandler(refreshCachePackages));
    router.delete('/packages', asyncHandler(deletePackages));

    return router;
}
