import React from 'react'
import DownloadSVG from './icon/download.svg'
function Header(props) {
    return (
        <div className="Header">
            <div className="Header-item">{props.filename || 'Untitle'}</div>
            <div className="Header-item text-center">{props.currentPage || '-'}/{props.totalPage || '-'}</div>
            <div className="Header-item text-right"><span><img src={DownloadSVG} width="20" height="20" alt="download" /></span></div>
        </div>
    )
}

export default Header