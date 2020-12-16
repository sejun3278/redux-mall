import React from 'react';

import '../../css/home.css'
import img from '../../source/img/img.json';

const Loading = () => {

    return(
        <div className='loading_div'>
            <div style={{ 'backgroundImage' : `url(${img.img.loading})`  }} />
        </div>
    )
}

export default Loading;