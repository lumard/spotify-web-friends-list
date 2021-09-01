import React, { useEffect, useState } from 'react';
import ReactDom from 'react-dom';

import "./content.css";

import FriendsList from './FriendsList/FriendsList';

const initScript = () => {
    if (document.readyState === "interactive")
        render();
    else
        document.addEventListener("load", () => {
            render();
        });
}

const getContainer: () => Promise<HTMLDivElement> = () => {
    return new Promise((resolve, reject) => {
        if (document.querySelector(".Root__top-container")) {
            resolve(document.querySelector(".Root__top-container") as HTMLDivElement);
            return;
        }
        let mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (/( |^)Root( |$)/.test((node as Element).className)) {
                        mutationObserver.disconnect();
                        resolve(document.querySelector(".Root__top-container") as HTMLDivElement);
                    }
                });
            });
        });
        mutationObserver.observe(document.body, {childList: true, subtree: true});
    });
}

const createContentContainer = (parent: HTMLDivElement) => {
    let container = document.createElement("div");
    container.className = "web-friends-list-container";
    parent.append(container);
    return container;
}

const render = () => {
    getContainer().then((container) => {
        ReactDom.render(<Content/>, createContentContainer(container));
    });
}

const Content = () => {

    const [enabled, setEnabled] = useState(false);
    const [includeOwnActivity, setIncludeOwnActivity] = useState(false);

    useEffect(() => {

        chrome.storage.sync.get(["enabled", "includeSelf"], (items) => {
            let keys = Object.keys(items);
            if (keys.includes("enabled")) setEnabled(items.enabled);
            else chrome.storage.sync.set({"enabled": true})
            if (keys.includes("includeSelf")) setIncludeOwnActivity(items.includeSelf);
            else chrome.storage.sync.set({"includeSelf": true});
        });

        const listener = (changes: {
                [key: string]: chrome.storage.StorageChange}) => {
            for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
                if (key === "enabled") {
                    setEnabled(newValue);
                } else if (key === "includeSelf") {
                    setIncludeOwnActivity(newValue);
                }
            }
        }
        chrome.storage.onChanged.addListener(listener);
        return () => {
            chrome.storage.onChanged.removeListener(listener);
        }
    }, []);

    return (
        <>
            {enabled ? <FriendsList includeOwnActivity={includeOwnActivity}/> : null}
        </>
    );

}

initScript();