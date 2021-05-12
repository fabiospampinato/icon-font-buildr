
/* IMPORT */

import {color} from 'specialist';

/* EXIT */

function exit ( message, code = 1 ) {

  console.log ( color.red ( message ) );

  process.exit ( code );

}

/* EXPORT */

export default exit;
