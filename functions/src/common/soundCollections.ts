import {Sound} from '../interfaces/Sound'
import {db, serverTimestamp} from './initFirebase'

export const getSounds = async (): Promise<Sound[]> => {
    const soundSnapshots = await db
        .collection('sounds')
        .get()

    return soundSnapshots.docs.map(sound => {
        return sound.data() as Sound
    })
}

export const addSound = async (tweetId: string, sound: Sound) => {
    await db
        .collection('sounds')
        .doc(sound.file)
        .set({
            ...sound,
            createdAt: serverTimestamp(),
            tweetId
        }, {merge: true})
}

export const getSound = async (fileName: string): Promise<Sound | null> => {
    const snapshot = await db
        .collection('sounds')
        .doc(fileName)
        .get()

    if (snapshot.exists) {
        return snapshot.data() as Sound
    }
    return null
}
