export declare type Buddy = { // response from /buddylist endpoint
    timestamp: number,
    track: BuddyTrack,
    user: {
        imageUrl: string,
        name: string,
        uri: string
    }
}

export declare type BuddyTrack = {
    album: {uri: string, name: string},
    artist: {uri: string, name: string},
    context: {uri: string, name: string},
    imageUrl: string,
    name: string,
    uri: string
}

export declare type Track = {
    album: Album,
    artists: Artists,
    id: string,
    uri: string,
    href: string,
    is_playable: boolean,
    is_local: boolean,
    name: string
}

export declare type Album = {
    artists: Artists
    href: string,
    id: string,
    uri: string,
    name: string,
    images: [{width: number, height: number, url: string},
        {width: number, height: number, url: string},
        {width: number, height: number, url: string}]
}

export declare type Playlist = {
    name: string,
    description: string,
    id: string,
    uri: string
}

export declare type Artists = {
    name: string,
    href: string,
    id: string,
    uri: string
}[]