
/* IMPORT */

import * as fs from 'fs';

/* COPY */

function copy ( src, dst ) { // Because `fs.copyFileSync` has only been added "recently"

  const content = fs.readFileSync ( src );

  fs.writeFileSync ( dst, content );

}

/* EXPORT */

export default copy;
