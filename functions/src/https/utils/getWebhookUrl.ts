import {db} from './initFirebase'

export const getWebhookUrl = async (teamId: string) => {
    const docSnapshot = await db.collection("installations").doc(teamId).get()

    if (docSnapshot.exists) {
        // @ts-ignore
        return docSnapshot.data().webhook.url
    }
    return null
}
