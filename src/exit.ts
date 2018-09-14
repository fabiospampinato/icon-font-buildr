
/* IMPORT */

import chalk from 'chalk';

/* EXIT */

function exit ( message, code = 0 ) {

  console.log ( chalk.red ( message ) );

  process.exit ( code );

}

/* EXPORT */

export default exit;
