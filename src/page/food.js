import React from 'react';

const Food = ({ match }) => {
    console.log(match)
    
    return (
        <div> 
            I Like Food 
            ( {match.params.name} )
        </div>
    );
}

export default Food;