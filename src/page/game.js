import React from 'react';
import queryString from 'query-string';

const Game = (props) => {

    const qry = queryString.parse(props.location.search);
    console.log(qry)
    
    return (
        <div> I Like Game ( {qry.name} ) </div>
    );
}

export default Game;