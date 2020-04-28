export interface Sound {
    title: string,
    file: string,
    episode: string,
    character: string,
    tweetId?: string
}

export const getFileUrl = (sound: Sound): string => `https://raw.githubusercontent.com/2ec0b4/kaamelott-soundboard/master/sounds/${sound.file}`
