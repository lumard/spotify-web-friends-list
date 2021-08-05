import React, { useEffect, useRef, useState } from 'react';

import './ResizeBar.css';

const ResizeBar: React.FC<{handleWidthChange: (width: number) => void}> = (props) => {

    const [mouseDown, setMouseDown] = useState(false);
    const [resize, setResize] = useState({width: 200, x: 0});

    const mouseDownRef = useRef(mouseDown);
    const resizeRef = useRef(resize);

    useEffect(() => {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        }
    }, []);

    useEffect(() => props.handleWidthChange(resize.width), [resize]);

    function handleMouseDown(ev: React.MouseEvent): void {
        setResize((res) => {
            resizeRef.current = {x: ev.pageX, width: res.width};
            return {x: ev.pageX, width: res.width};
        });
        setMouseDown(() => {
            mouseDownRef.current = true;
            return true;
        });
    }

    function handleMouseUp(ev: MouseEvent): void {
        setMouseDown(() => {
            mouseDownRef.current = false;
            return false;
        });
    }

    function handleMouseMove(ev: MouseEvent): void {
        if (mouseDownRef.current) {
            setResize((res) => {
                let offset = res.x - ev.pageX;
                offset = Math.sign(offset) * Math.floor(Math.abs(offset) / 10) * 10;
                if (res.width + offset > 400 || res.width + offset < 150 || offset === 0)
                    return res;
                return {x: ev.pageX, width: res.width + offset};
            });
        }
    }

    return (
        <div
            className="layout-resizer"
            onMouseDown={handleMouseDown}>
            <input
                type="range"
                min="150" max="400"
                step="10" value={resize.width}/>
        </div>
    );

}

export default ResizeBar;