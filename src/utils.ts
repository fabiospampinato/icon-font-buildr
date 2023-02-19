
/* IMPORT */

import path from 'node:path';
import process from 'node:process';
import merge from 'plain-object-merge';
import {color} from 'specialist';

/* MAIN */

const exit = ( message: string ): never => {

  console.log ( color.red ( message ) );

  process.exit ( 1 );

};

const isArray = ( value: unknown ): value is unknown[] => {

  return Array.isArray ( value );

};

const isNumber = ( value: unknown ): value is number => {

  return typeof value === 'number';

};

const isObject = ( value: unknown ): value is object => {

  return typeof value === 'object' && value !== null;

};

const isString = ( value: unknown ): value is string => {

  return typeof value === 'string';

};

const isUrl = ( value: string ): value is string => {

  return value.includes ( '://' ); // Not perfect, but good enough

};

const makeAbs = ( filePath: string ): string => {

  if ( isUrl ( filePath ) || path.isAbsolute ( filePath ) ) return filePath;

  return path.resolve ( process.cwd (), filePath );

};

const partition = <T, U> ( values: T[], filterer: ( value: unknown ) => value is U ): [U[], Exclude<T, U>[]] => {

  const positive: U[] = [];
  const negative: Exclude<T, U>[] = [];

  for ( let i = 0, l = values.length; i < l; i++ ) {

    const value = values[i];

    if ( filterer ( value ) ) {

      positive.push ( value );

    } else {

      negative.push ( value );

    }

  }

  return [positive, negative];

};

const uniq = <T> ( values: T[] ): T[] => {

  return Array.from ( new Set ( values ) );

};

/* EXPORT */

export {exit, isArray, isNumber, isObject, isString, isUrl, makeAbs, merge, partition, uniq};
