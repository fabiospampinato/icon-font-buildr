#!/usr/bin/env node

/* IMPORT */

import * as _ from 'lodash';
import * as minimist from 'minimist';
import * as rdf from 'require-dot-file';
import IconFontBuildr from '.';

/* CONFIG */

const argv = minimist ( process.argv.slice ( 2 ) ),
      config = ( argv.config && require ( argv.config ) ) || rdf ( 'icon_font.json', process.cwd () ) || {};

/* ICON FONT BUILDR */

new IconFontBuildr ( config ).build ();
