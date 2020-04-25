export interface Sound {
    title: string,
    file: string,
    episode: string,
    character: string
}

export const getFileUrl = (sound: Sound): string => `https://raw.githubusercontent.com/2ec0b4/kaamelott-soundboard/master/sounds/${sound.file}`
export const getFileGUID = (sound: Sound): string => `kaamelott-soundboard/${sound.file}`
