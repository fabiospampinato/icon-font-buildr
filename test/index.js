
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
        {
          icon: 'amazon',
          name: 'amazonIcon'
        },
        {
          icon: 'android-debug-bridge',
          name: 'my debug icon',
          codepoints: [ '\E042', '\E000' ],
          ligatures: [ 'DEBUG', 'DEBUG2' ]
        },
        'public_domain'
      ],
      output: {
        codepoints: true,
        ligatures: true,
        icons: path.join ( __dirname, 'buildr-icons' ),
        fonts: path.join ( __dirname, 'buildr-fonts' ),
        fontName: 'IconFont'
      }
    });

    await builder.build ();

    t.true ( fs.existsSync ( path.join ( builder.config.output.icons, 'public_domain.svg' ) ) );
    t.true ( fs.existsSync ( path.join ( builder.config.output.fonts, 'IconFont.woff2' ) ) );

    del.sync ( builder.config.output.icons );
    del.sync ( builder.config.output.fonts );

  });

});
