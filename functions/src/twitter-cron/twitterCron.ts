import {getSoundboardSounds} from '../common/getSoundboardSounds'
import {Sound} from '../interfaces/Sound'
import * as functions from 'firebase-functions'
import {addSound, getSounds} from '../common/soundCollections'
import {initTwitter, twitterClient} from './twitter'
import {uploadMedia} from './uploadMedia'


export const twitterCron = async () => {
    initTwitter(functions.config().twitter)
    const missingQuotes = await getMissingQuotes()
    console.log(missingQuotes.length, "missing quotes")
    await uploadMissingQuotes(missingQuotes)
}

export const twitterCronCallable = functions.https.onRequest(async (request, response) => {
    await twitterCron()
    response.send()
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
    const tweetId = await addQuoteToTwitter(quotes[0])
    await saveQuote(tweetId, quotes[0])

    // for(let i = 0; i < quotes.length; i++) {
    //     console.log("Add sound ",quotes[i].file )
    //
    //     await saveQuote(quotes[i])
    // }
}

const saveQuote = async (tweetId: string, quote: Sound) => {
    console.log(quote)
    await addSound(tweetId, quote)
}

const addQuoteToTwitter = async (quote: Sound): Promise<string> => {
    if (!twitterClient) {
        throw new functions.https.HttpsError(
            'failed-precondition',
            'Missing Twitter credentials'
        )
    }

    await uploadMedia(quote)

    return twitterClient
        .post('statuses/update', {status: quote.file})
        .then(tweet => tweet.id_str)
}

//  `https://twitter.com/${functions.config().twitter.account_name}/status/${tweet.id_str}`
