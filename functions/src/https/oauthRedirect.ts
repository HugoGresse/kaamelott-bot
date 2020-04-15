import * as functions from 'firebase-functions'
import * as corsModule from 'cors'

const cors = corsModule({origin: true,})

export const oauthRedirect = functions.https.onRequest((req, res) => {
    return cors(req, res, () => {

        return res.status(200).send()
    })
})
