/*
 * This file is part of the Fxp Satis Serverless package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {EventBus} from '@app/ui/events/EventBus';

/**
 * @author François Pluchino <francois.pluchino@gmail.com>
 */
declare module 'vue/types/vue'
{
    interface Vue
    {
        $eventBus: EventBus;
    }
}
