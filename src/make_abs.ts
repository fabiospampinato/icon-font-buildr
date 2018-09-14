
/* IMPORT */

import * as _ from 'lodash';
import * as isUrl from 'is-url';
import * as path from 'path';

/* MAKE ABS */

function makeAbs ( p ) {

  if ( !_.isString ( p ) || isUrl ( p ) || path.isAbsolute ( p ) ) return p;

  return path.resolve ( process.cwd (), p );

}

/* EXPORT */

export default makeAbs;
