#!/usr/bin/env node

/* IMPORT */

import * as caporal from 'caporal';
import * as minimist from 'minimist';
import * as readPkg from 'read-pkg-up';
import * as rdf from 'require-dot-file';
import * as updateNotifier from 'update-notifier';
import IconFontBuildr from '.';

/* CLI */

async function CLI () {

  const {pkg} = await readPkg ({ cwd: __dirname });

  updateNotifier ({ pkg }).notify ();

  caporal
    .version ( pkg.version )
    .option ( '--config <path>', 'Path to the config file' )
    .action ( () => {

      const argv = minimist ( process.argv.slice ( 2 ) ),
            config = ( argv.config && require ( argv.config ) ) || rdf ( 'icon_font.json', process.cwd () ) || {};

      new IconFontBuildr ( config ).build ();

    });

  caporal.parse ( process.argv );

}

CLI ();
