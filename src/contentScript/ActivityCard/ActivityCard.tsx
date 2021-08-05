import React from 'react';

import {Buddy} from '../SpotifyApi/SpotifyObjects';
import {uriToId} from '../SpotifyApi/spotifyHelper';

import './ActivityCard.css';

const ActivityCard: React.FC<Buddy & {now: number, index: number}> = (props) => {

    // props
    /*
    user avatar
    username
    user id
    song name
    artist name
    artist id
    playlist/album id
    playlist/album name
    timestamp
    */

    const timestampToString: () => string = () => {
        let difference = props.now - props.timestamp;
        let twentyMin = 20 * 60 * 1000;
        let oneHour = 60 * 60 * 1000;
        let oneDay = 24 * oneHour;
        if (difference < twentyMin) return "Now";
        if (difference < oneHour) return `${Math.round(difference / 1000 / 60)} min`;
        if (difference < oneDay) return `${Math.round(difference / 1000 / 60 / 60)} hr`;
        return `${Math.round(difference / 1000 / 60 / 60 / 24)} d`;
    }

    const contextToClass: () => string = () => {
        let type = uriToId(props.track.context.uri).type;
        switch(type) {
            case "artist":
                return "spoticon-artist-16";
                break;
            case "playlist":
                return "spoticon-playlist-16";
                break;
            case "album":
            default:
                return "spoticon-album-16";
                break;
        }
    }

    const prepareContextLink: () => string = () => {
        let context = uriToId(props.track.context.uri);
        return `https://open.spotify.com/${context.type}/${context.id}`;
    }

    const handleTrackStart: (ev: React.MouseEvent) => void = (ev) => {
        ev.preventDefault();
    }

    return (
        <li className="activity-card">
            <div className={`activity-card-content ${props.index === 0 ? "activity-slide-in" : ""}`}>
                <div className="activity-user-avatar-container">
                    <div
                        className={`activity-user-avatar ${timestampToString() === "Now" ? "activity-user-avatar-halo" : ""}`}
                        style={{backgroundImage: `url(${props.user.imageUrl})`}}></div>
                </div>
                <div className="activity-user-info">
                    <div className="activity-user-header">
                        <a 
                            className="activity-link activity-user-header-name"
                            href={`https://open.spotify.com/user/${uriToId(props.user.uri).id}`}>
                            <h4>{props.user.name}</h4>
                        </a>
                        <span className="activity-user-header-timestamp">{timestampToString()}</span>
                    </div>
                    <div className="activity-details">
                        <a 
                        className="activity-track-details activity-link"
                        href="#" onClick={handleTrackStart}>{props.track.name}</a>
                        <span className="activity-details-space"> ᛫ </span>
                        <a 
                        className="activity-artist-details activity-link"
                        href={`https://open.spotify.com/artist/${uriToId(props.track.artist.uri).id}`}>
                            {props.track.artist.name}</a>
                    </div>
                    <div className="context-details">
                        <span className={`activity-context-details ${contextToClass()}`}> 
                        <a  className="activity-link"
                            href={prepareContextLink()}> {props.track.context.name}</a></span>
                    </div>
                </div>
            </div>
        </li>
    );

}

export default ActivityCard;