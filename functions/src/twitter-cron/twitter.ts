import * as functions from 'firebase-functions'
import * as Twitter from 'twitter'
import {isEmpty} from 'lodash'

export let twitterClient: Twitter | null = null

export const initTwitter = (twitterCredentials: {
    consumer_key: string,
    consumer_secret: string,
    access_token_key: string,
    access_token_secret: string,
}) => {
    if (isEmpty(twitterCredentials)) {
        throw new functions.https.HttpsError(
            'failed-precondition',
            'Missing Twitter credentials'
        )
    }

    twitterClient = new Twitter({
        consumer_key: twitterCredentials.consumer_key,
        consumer_secret: twitterCredentials.consumer_secret,
        access_token_key: twitterCredentials.access_token_key,
        access_token_secret: twitterCredentials.access_token_secret
    })

    return twitterClient
}
