
/* IMPORT */

import {describe} from 'ava-spec';
import * as del from 'del';
import * as fs from 'fs';
import * as path from 'path';
import IconFontBuildr from '../dist';

/* ICON FONT BUILDER */

describe ( 'Icon Font Buildr', it => {

  it ( 'Creates an icon font', async t => {

    const builder = new IconFontBuildr ({
      sources: [
        path.join ( __dirname, 'icons', '[icon].svg' ),
        'https://material.io/tools/icons/static/icons/baseline-[icon]-24px.svg',
        'https://raw.githubusercontent.com/Templarian/MaterialDesign/master/icons/svg/[icon].svg'
      ],
      icons: [
        'backup',
        'bug_report',
        'amazon',
        'android-debug-bridge',
        'public_domain'
      ],
      output: {
        icons: path.join ( __dirname, 'builder-icons' ),
        fonts: path.join ( __dirname, 'builder-fonts' ),
        fontName: 'CustomFont'
      }
    });

    await builder.build ();

    t.true ( fs.existsSync ( path.join ( builder.config.output.icons, 'public_domain.svg' ) ) );
    t.true ( fs.existsSync ( path.join ( builder.config.output.fonts, 'CustomFont.woff2' ) ) );

    del.sync ( builder.config.output.icons );
    del.sync ( builder.config.output.fonts );

  });

});
