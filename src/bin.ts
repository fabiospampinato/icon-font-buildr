#!/usr/bin/env node

/* IMPORT */

import rdf from 'require-dot-file';
import {program, updater} from 'specialist';
import {description, name, version} from '../package.json';
import IconFontBuildr from '.';

/* MAIN */

updater ({ name, version });

program
  .name ( name )
  .version ( version )
  .description ( description )
  .option ( '-c, --config <path>', 'Path to the config file' )
  .action ( options => {
    const config = ( options.config && require ( options.config ) ) || rdf ( 'icon_font.json', process.cwd () ) || {};
    new IconFontBuildr ( config ).build ();
  });

program.parse ();
