const uriToId: (uri: string) => {
    spotify: string,
    type: string,
    id: string
} = (uri) => {
    if (uri.includes(":")) {
        let split = uri.split(":");
        return {
            spotify: split[0]!,
            type: split[1]!,
            id: split[2]!
        };
    }
    return {
        spotify: "spotify",
        type: "",
        id: uri
    };
}

export {uriToId};