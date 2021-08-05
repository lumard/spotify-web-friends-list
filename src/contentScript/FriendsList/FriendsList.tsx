import React, { useEffect, useRef, useState } from 'react';

import {uriToId} from '../SpotifyApi/spotifyHelper';
import SpotifyApi from '../SpotifyApi/SpotifyApi';
import BuddyWebSocket from '../SpotifyApi/BuddyWebSocket';
import {Buddy, BuddyTrack} from '../SpotifyApi/SpotifyObjects';

import ActivityCard from '../ActivityCard/ActivityCard';
import ResizeBar from '../ResizeBar/ResizeBar';

import "./FriendsList.css";

const FriendsList: React.FC<{includeOwnActivity: boolean}> = (props) => {

    const [friends, setFriends]: [Buddy[], React.Dispatch<React.SetStateAction<Buddy[]>>] = useState(new Array<Buddy>());
    const [now, setNow] = useState(Date.now());
    const [listWidth, setListWidth] = useState(150);
    const [me, setMe] = useState(""); // spotify user id

    const spotifyApi = useRef(new SpotifyApi());
    const buddyWebSocket: React.MutableRefObject<BuddyWebSocket | undefined> = useRef();

    useEffect(() => {
        spotifyApi.current.whenReady().then(() => {
            initFriendsList();
            restoreOnline();
        });
        updateTime();
    }, []);

    useEffect(() => {
        if (friends.length > 0 && spotifyApi.current.token.length > 0 &&
            (!buddyWebSocket.current || buddyWebSocket.current.readyState === WebSocket.CLOSED)) {
            prepareBuddyWebSocket();
        }
    }, [friends]);

    function handleWidthChange(width: number) {
        setListWidth(width);
    }

    function updateTime() {
        setInterval(() => setNow(Date.now()), 60 * 1000);
    }

    async function initFriendsList(): Promise<Array<Buddy>> {
        let activities: Array<Buddy> = [];
        try {
            let buddyList = await spotifyApi.current.fetchBuddyList();
            activities = buddyList;
        } catch (err) {
            console.error(err);
            if (friends.length === 0)
                setTimeout(() => initFriendsList(), 60 * 1000);
            return [];
        }
        try {
            let myActivity = await spotifyApi.current.fetchOwnActivity();
            setMe(myActivity.user.name);
            activities.push(myActivity);
        } catch (err) {
            console.error(err);
            console.error("User activity is turned off in options");
        }
        
        setFriends(activities);
        return [];
    }

    function restoreOnline() {
        window.addEventListener("online", async () => {
            if (spotifyApi.current.tokenExpireAt <= Date.now())
                await spotifyApi.current.refreshToken();
            if (buddyWebSocket.current && buddyWebSocket.current.readyState === WebSocket.CLOSED)
                initFriendsList();
        });
    }

    function prepareBuddyWebSocket() {
        buddyWebSocket.current = new BuddyWebSocket(spotifyApi.current.token);
        buddyWebSocket.current.addEventListener("connectionId", ((event: CustomEvent<{id: string}>) => {
            let ids = friends.map(friend => uriToId(friend.user.uri).id);
            spotifyApi.current.subscribeToActivity(event.detail.id, ids);
        }) as EventListener);
        buddyWebSocket.current.addEventListener("activity", ((event: CustomEvent<{
            timestamp: number,
            username: string,
            contextUri: string | null,
            trackUri: string,
            contextIndex: 0 | null
        }>) => {
            parsePresence(event.detail).then(activityParsed => {
                setFriends(friends => {
                    let f = [...friends];
                    f.map(friend => {
                        if (uriToId(friend.user.uri).id === event.detail.username) {
                            friend.track = activityParsed;
                            friend.timestamp = event.detail.timestamp;
                        }
                        return friend;
                    });
                    return f;
                });
            });
        }) as EventListener);
        buddyWebSocket.current.addEventListener("close", () => {
            setTimeout(() => {
                if (buddyWebSocket.current?.readyState === WebSocket.CLOSED)
                    prepareBuddyWebSocket();
            }, 10 * 1000);
        });
    }

    async function parsePresence(presence: {
        username: string,
        trackUri: string,
        contextUri: string | null,
        timestamp: number,
        contextIndex: 0 | null
    }): Promise<BuddyTrack> {
        let track = await spotifyApi.current.resolveTrack(presence.trackUri);
        let context: {name: string, uri: string};

        let contextId = presence.contextUri ? uriToId(presence.contextUri) : {
            spotify: "spotify", type: "album", id: ""
        };
        switch(contextId.type) {
            case "playlist":
                let playlist = await spotifyApi.current.resolvePlaylist(presence.contextUri!);
                context = {
                    name: playlist.name,
                    uri: playlist.uri
                };
                break;
            case "artist":
                context = {
                    name: track.artists[0]!.name,
                    uri: track.artists[0]!.uri
                };
                break;
            case "album":
            default:
                context = {name: track.album.name, uri: track.album.uri};
                break;
        }
        let buddyTrack = {
            name: track.name,
            uri: track.uri,
            imageUrl: track.album.images[0].url,
            album: {name: track.album.name, uri: track.album.uri},
            artist: {name: track.artists[0]!.name, uri: track.artists[0]!.uri},
            context: context
        };
        return buddyTrack;
    }

    return (
        <div className="web-friends-list" style={{width: `${listWidth}px`}}>
            <ResizeBar handleWidthChange={handleWidthChange}/>
            <div className="friends-list">
                <div className="friends-list-title">
                    <h4>Friend Activity</h4>
                </div>
                <div className="friends-list-content">
                    <ul className="friends-list-content-list">
                    {friends
                        .sort((a, b) => {
                            if (a.timestamp > b.timestamp)
                                return -1;
                            else if (a.timestamp === b.timestamp)
                                return 0;
                            return 1;
                        })
                        .filter(friend => props.includeOwnActivity || friend.user.name !== me)
                        .map((friend, i) => <ActivityCard track={friend.track}
                            timestamp={friend.timestamp}
                            user={friend.user}
                            key={friend.user.uri}
                            now={now}
                            index={i}/>)}
                    </ul>
                </div>
            </div>
        </div>
    );

};

export default FriendsList;