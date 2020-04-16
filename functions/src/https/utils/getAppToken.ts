import {db} from './initFirebase'

export const getAppToken = async (teamId: string): Promise<string | null> => {
    const docSnapshot = await db.collection("installations").doc(teamId).get()

    if (docSnapshot.exists) {
        // @ts-ignore
        return docSnapshot.data().token
    }
    return null
}
