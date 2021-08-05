class BuddyWebSocket extends WebSocket {

    heartbeatInterval: number = 0;

    constructor(token: string) {
        super(`wss://gew-dealer.spotify.com/?access_token=${token}`);
        this.heartbeat();
        super.addEventListener("message", ev => this.handleMessage(ev.data));
        super.addEventListener("close", () => this.handleClose());
        window.addEventListener("close", () => super.close(1000));
    }

    heartbeat(): void {
        this.heartbeatInterval = setInterval(() => {
            super.send(JSON.stringify({
                "type": "ping"
            }));
        }, 60 * 1000);
    }

    handleMessage(message: string) {
        let payload;
        try {
            payload = JSON.parse(message);
        } catch(e) {
            console.error(e);
            return;
        }
        if (!payload.uri) return;

        if (/^hm:\/\/pusher\/v1\/connections\//.test(payload.uri)) {
            this.handleInitPayload(payload);
        } else if (/^hm:\/\/presence2\/user\//.test(payload.uri)) {
            this.handleActivityPayload(payload);
        }
    }

    handleInitPayload(payload: {headers: {"Spotify-Connection-Id": string}, method: "PUT", type: "message", uri: string}) {
        let connectionEvent = new CustomEvent("connectionId", {detail: {
            id: payload.headers["Spotify-Connection-Id"]
        }});
        super.dispatchEvent(connectionEvent);
    }

    handleActivityPayload(payload: {headers: object, method: "POST", type: "message", uri: string,
            payloads: [string]}) {
        let activity = JSON.parse(atob(payload.payloads[0]));
        let activityEvent = new CustomEvent("activity", {detail: activity});
        super.dispatchEvent(activityEvent);
    }

    handleClose() {
        clearInterval(this.heartbeatInterval);
    }

}

export default BuddyWebSocket;