
/* IMPORT */

import chalk from 'chalk';

/* EXIT */

function exit ( message, code = 1 ) {

  console.log ( chalk.red ( message ) );

  process.exit ( code );

}

/* EXPORT */

export default exit;
