import {Buddy, Playlist, Track} from './SpotifyObjects';

import {uriToId} from './spotifyHelper';

class SpotifyApi extends EventTarget {

    token: string = "";
    tokenExpireAt: number = Date.now();

    constructor() {
        super();
        this.keepTokenValid();
    }

    async whenReady(): Promise<void> {
        if (this.token.length > 0) return;
        return new Promise((resolve) => {
            this.addEventListener("ready", () => {
                resolve();
            });
        });
    }

    async obtainToken(): Promise<{accessToken: string, accessTokenExpirationTimestampMs: number}> {
        let response = await 
            fetch("https://open.spotify.com/get_access_token?reason=transport&productType=web_player");
        if (response.status === 200)
            return response.json();
        throw new Error("authorization token is inaccessible");
    }

    async refreshToken() {
        let tokenPayload;
        try {
            tokenPayload = await this.obtainToken();
        } catch(err) {
            console.error(err);
            return;
        }
        this.token = tokenPayload.accessToken;
        this.tokenExpireAt = tokenPayload.accessTokenExpirationTimestampMs;
    }

    async keepTokenValid(): Promise<void> {
        await this.refreshToken();
        let readyEvent = new CustomEvent("ready");
        super.dispatchEvent(readyEvent);
        setTimeout(() => this.keepTokenValid(), 
            this.tokenExpireAt - Date.now() - (60 * 1000));
    }

    async fetchBuddyList(): Promise<Array<Buddy>> {
        let res = await fetch("https://spclient.wg.spotify.com/presence-view/v1/buddylist", {
            headers: {
                "Authorization": `Bearer ${this.token}`,
                "Accept": "application/json"
            }
        });
        if (res.status === 200)
            return (await res.json()).friends;
        throw new Error("https://spclient.wg.spotify.com/presence-view/v1/buddylist request was unsuccessfull");
    }

    async fetchOwnId(): Promise<string> {
        let res = await fetch("https://api.spotify.com/v1/me", {
            headers: {
                "Authorization": `Bearer ${this.token}`,
                "Accept": "application/json"
            }
        });
        if (res.status === 200) {
            let payload = await res.json();
            return payload.id;
        }
        throw new Error("https://api.spotify.com/v1/me request was unsuccessfull");
    }

    async fetchOwnActivity(): Promise<Buddy> {
        let id;
        try {
            id = await this.fetchOwnId();
        } catch(err) {
            throw err;
        }
        let res = await fetch("https://spclient.wg.spotify.com/presence-view/v1/user/" + id, {
            headers: {
                "Authorization": `Bearer ${this.token}`,
                "Accept": "application/json"
            }
        });
        if (res.status === 200)
            return res.json();
        throw new Error("https://spclient.wg.spotify.com/presence-view/v1/user/ request was unsuccessfull");
    }

    subscribeToActivity(connectionId: string, ids: string | string[]): void {
        if (typeof ids === "string") ids = [ids];
        ids.forEach(id => {
            fetch(`https://spclient.wg.spotify.com/presence2/sub/user/${id}/connection_id/${connectionId}`, 
            {
                "method": "POST",
                "headers": {
                    "Authorization": `Bearer ${this.token}`
                }
            }).then(res => {
                if (res.status !== 200) console.error("Activity subscription attempt failed");
            });
        });
    }

    async resolvePlaylist(uri: string): Promise<Playlist> {
        let id = uriToId(uri).id;
        let response = await fetch(`https://spclient.wg.spotify.com/playlist/v2/playlist/${id}/metadata`, 
            {
                headers: {"Authorization": `Bearer ${this.token}`,
                    "Accept": "application/json",
                    "app-platform": "WebPlayer"
                },
            });
        if (response.status === 200) {
            let payload = await response.json();
            return {
                name: payload.attributes.name,
                description: payload.attributes.description,
                id: id,
                uri: "spotify:playlist:" + id
            };
        }
        throw new Error("https://spclient.wg.spotify.com/playlist/v2/playlist/ request was unsuccessfull");
    }

    async resolveTrack(uri: string): Promise<Track> {
        let id = uriToId(uri).id;
        let response = await fetch(`https://api.spotify.com/v1/tracks?ids=${id}&market=from_token`, 
            {
                headers: {"Authorization": `Bearer ${this.token}`,
                    "Accept": "application/json",
                    "app-platform": "WebPlayer"
                },
            });   
        if (response.status === 200)
            return (await response.json()).tracks[0];
        throw new Error("https://api.spotify.com/v1/tracks/ request was unsuccessfull");
    }

}

export default SpotifyApi;