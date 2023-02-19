#!/usr/bin/env node

/* IMPORT */

import findUp from 'find-up-json';
import fs from 'node:fs';
import {bin} from 'specialist';
import IconFontBuildr from '.';

/* MAIN */

bin ( 'icon-font-buildr', 'Build custom icon fonts' )
  /* DEFAULT COMMAND */
  .option ( '-c, --config <path>', 'Path to the config file' )
  .action ( options => {
    const configPath = options['config'];
    const config = configPath ? JSON.parse ( fs.readFileSync ( configPath, 'utf8' ) ) : findUp ( 'icon_font.json' )?.content || {};
    const buildr = new IconFontBuildr ( config );
    return buildr.build ();
  })
  /* RUN */
  .run ();
