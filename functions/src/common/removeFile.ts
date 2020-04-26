import * as fs from "fs"

export const removeFile = (fileName: string) => {
    return new Promise((resolve, reject) => {
        fs.unlink(fileName, (err: Error | null) => {
            if (err) {
                reject(err)
                return
            }

            resolve()
        })
    })
}
