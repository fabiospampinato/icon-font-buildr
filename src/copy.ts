
/* IMPORT */

import * as fs from 'fs';

/* COPY */

function copy ( src, dst ) {

  const content = fs.readFileSync ( src );

  fs.writeFileSync ( dst, content );

}

/* EXPORT */

export default copy;
