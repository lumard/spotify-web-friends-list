import React, {useState, useEffect} from 'react';
import ReactDom from 'react-dom';

import "./action.css";

const Action: React.FC = () => {

    const [enabled, setEnabled] = useState(true);
    const [includeSelf, setIncludeSelf] = useState(true);

    useEffect(() => {
        chrome.storage.sync.get(["enabled", "includeSelf"], (items) => {
            let keys = Object.keys(items);
            if (keys.includes("enabled")) setEnabled(items.enabled);
            else chrome.storage.sync.set({"enabled": enabled})
            if (keys.includes("includeSelf")) setIncludeSelf(items.includeSelf);
            else chrome.storage.sync.set({"includeSelf": includeSelf});
        });
    }, []);

    const handleEnableClick = () => {
        chrome.storage.sync.set({
            enabled: !enabled
        });
        setEnabled(enabled => !enabled);
    }

    const handleSelfActivityClick = () => {
        chrome.storage.sync.set({
            includeSelf: !includeSelf
        });
        setIncludeSelf(includeSelf => !includeSelf);
    }

    return (
        <div className="action-container">
            <div>
                <h1>Spotify Friends List</h1>
                <ul>
                    <li>
                        <label>Display List</label>
                        <div className={`switch ${enabled ? "switch-active": ""}`} onClick={handleEnableClick}>
                            <input type="checkbox" checked={enabled}/>
                            <span className={`slider ${enabled ? "slider-active": ""}`}></span>
                        </div>
                    </li>
                    <li style={{display: enabled ? "" : "none"}}>
                        <label>Include My Activity</label>
                        <div className={`switch ${includeSelf ? "switch-active": ""}`} onClick={handleSelfActivityClick}>
                            <input type="checkbox" checked={includeSelf}/>
                            <span className={`slider ${includeSelf ? "slider-active": ""}`}></span>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    );
}

ReactDom.render(
    <Action/>,
    document.getElementById("container")
);