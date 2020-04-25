import * as functions from 'firebase-functions'
import * as Twitter from 'twitter'
import {isEmpty} from 'lodash'

export let twitterInstance: Twitter | null = null

export const initTwitter = () => {
    const {twitter} = functions.config()

    if (isEmpty(twitter)) {
        throw new functions.https.HttpsError(
            'failed-precondition',
            'Missing Twitter credentials'
        )
    }

    twitterInstance = new Twitter({
        consumer_key: '',
        consumer_secret: '',
        access_token_key: '',
        access_token_secret: ''
    })

    return twitter
}
