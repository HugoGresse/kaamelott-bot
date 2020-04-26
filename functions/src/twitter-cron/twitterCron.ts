import {getSoundboardSounds} from '../common/getSoundboardSounds'
import {Sound} from '../interfaces/Sound'
import * as functions from 'firebase-functions'
import {addSound, getSounds} from '../common/soundCollections'
import {initTwitter, twitterClient} from './twitter'
import {uploadMedia} from './uploadMedia'


export const twitterCronTask = async () => {
    initTwitter(functions.config().twitter)
    const missingQuotes = await getMissingQuotes()
    console.log(missingQuotes.length, "missing quotes")
    await uploadMissingQuotes(missingQuotes)
}

export const twitterCron = functions.pubsub.schedule('every 3 minutes').onRun(async () => {
    await twitterCronTask()
    return null
})

export const twitterCronCallable = functions.https.onRequest(async (request, response) => {
    try {
        await twitterCronTask()
        response.send({
            success: true
        })
    } catch (error) {
        response.status(500).send({
            msg: "error",
            error
        })
    }
})


const getMissingQuotes = async (): Promise<Sound[]> => {
    const firestoreQuotes = await getSounds()
    const firestoreSoundAsMap = firestoreQuotes.reduce((acc: { [key: string]: Sound }, item) => {
        acc[item.file] = item
        return acc
    }, {} as { string: Sound })
    const kaamelottSoundboardQuotes = await getSoundboardSounds()

    return kaamelottSoundboardQuotes.filter(sound => !firestoreSoundAsMap[sound.file])
}

const uploadMissingQuotes = async (quotes: Sound[]) => {
    if (quotes.length > 0) {
        const tweetId = await addQuoteToTwitter(quotes[0])
        await saveQuote(tweetId, quotes[0])
    }
}

const saveQuote = async (tweetId: string, quote: Sound) => {
    console.log(`>Added ${quote.title}!`)
    await addSound(tweetId, quote)
}

const addQuoteToTwitter = async (quote: Sound): Promise<string> => {
    if (!twitterClient) {
        throw new functions.https.HttpsError(
            'failed-precondition',
            'Missing Twitter credentials'
        )
    }

    return uploadMedia(quote)
        .then(mediaId => {
            if (!twitterClient) {
                throw new functions.https.HttpsError(
                    'failed-precondition',
                    'Missing Twitter credentials'
                )
            }

            return twitterClient
                .post('statuses/update', {
                    status: quote.title,
                    media_ids: mediaId
                })
                .then(tweet => tweet.id_str)
        }).catch(error => {
            throw new functions.https.HttpsError(
                'internal',
                'Failed to upload file or convert it, ' + error
            )
        })
}

//  `https://twitter.com/${functions.config().twitter.account_name}/status/${tweet.id_str}`
