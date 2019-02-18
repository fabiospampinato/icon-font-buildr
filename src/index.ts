
/* IMPORT */

import mergeWith = require ( 'lodash/mergeWith' );
import isArray = require ( 'lodash/isArray' );
import chalk from 'chalk';
import * as del from 'del';
import * as execa from 'execa';
import * as fs from 'fs';
import * as globby from 'globby';
import * as got from 'got';
import * as isUrl from 'is-url';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import * as svg2font from 'svgicons2svgfont';
import * as temp from 'temp';
import * as ttf2woff2 from 'ttf2woff2';
import copy from './copy';
import exit from './exit';
import makeAbs from './make_abs';

temp.track ();

/* ICON FONT BUILDR */

class IconFontBuildr {

  /* VARIABLES */

  configDefault; config; paths;

  /* CONSTRUCTOR */

  constructor ( config? ) {

    this.configInit ( config );
    this.configCheck ();

  }

  /* CONFIG */

  configInit ( config? ) {

    this.configDefault = {
      sources: [],
      icons: [],
      output: {
        codepoints: false,
        ligatures: true,
        icons: undefined,
        fonts: path.join ( process.cwd (), 'icon_font' ),
        fontName: 'IconFont',
        formats: [
          'eot',
          'ttf',
          'woff',
          'woff2'
        ]
      }
    };

    this.config = mergeWith ( {}, this.configDefault, config, ( prev, next ) => isArray ( next ) ? next : undefined );

    this.config.icons = Object.keys(this.config.icons).reduce((obj, val) => {
        const iconConfig = this.config.icons[val],
              key = iconConfig.icon || iconConfig

        obj[key] = {
          icon: key,
          name: iconConfig.name || key,
          // default values:
          codepoints: undefined,
          ligatures: [ key.replace ( /-/g, '_' ) ] // Hyphens aren't supported
        };

        // deduplicating user input and filtering empty entries
        if(iconConfig.codepoints && Array.isArray(iconConfig.codepoints) && iconConfig.codepoints.length) {
          obj[key].codepoints = iconConfig.codepoints.filter((value, index, array) => (value && array.indexOf(value) === index));
        }
        if(iconConfig.ligatures && Array.isArray(iconConfig.ligatures) && iconConfig.ligatures.length) {
          obj[key].ligatures = iconConfig.ligatures.filter((value, index, array) => (value && array.indexOf(value) === index));
        }

        return obj
    }, {})
    this.config.sources = this.config.sources.map ( makeAbs );
    this.config.output.icons = makeAbs ( this.config.output.icons );
    this.config.output.fonts = makeAbs ( this.config.output.fonts );

  }

  configCheck () {

    if ( !this.config.sources.length ) exit ( 'You need to provide at least one source, both remote and local sources are supported' );

    const sourceUntokenized = this.config.sources.find ( source => !source.includes ( '[icon]' ) );

    if ( sourceUntokenized ) exit ( `The "${chalk.bold ( sourceUntokenized )}" source doesn't include the "${chalk.bold ( '[icon]' )}" token` );

    if ( !Object.keys(this.config.icons).length ) exit ( 'You need to provide at least one icon' );

    Object.keys(this.config.icons).map(key => this.config.icons[key]).reduce((checkObject, icon) => {
      if(icon.codepoints) {
        icon.codepoints.forEach(codepoint => {
          if(checkObject.codepoints.indexOf(codepoint) !== -1) exit ( `Codepage "${codepoint}" was used multiple times (icon ${icon.icon})!` )
          checkObject.codepoints.push(codepoint);
        });
        checkObject.codepoints.push(icon);
      }

      icon.ligatures.forEach(ligature => {
        if(checkObject.ligatures.indexOf(ligature) !== -1) exit ( `Ligature "${ligature}" was used multiple times (icon ${icon.icon})!` )
        checkObject.ligatures.push(ligature);
      });

      return checkObject;
    }, { codepoints: [], ligatures: [] });

    const formats = this.configDefault.output.formats;

    if ( !this.config.output.formats.length ) exit ( `You need to provide at least one format, supported formats: ${formats.map ( format => `"${chalk.bold ( format )}"` ).join ( ', ' )}` );

    if ( !this.config.output.codepoints && !this.config.output.ligatures ) exit ( `Both "${chalk.bold ( 'output.codepoints' )}" and "${chalk.bold ( 'output.ligatures' )}" can't be "${chalk.bold ( 'false' )}"` );

    const formatUnsupported = this.config.output.formats.find ( format => !formats.includes ( format ) );

    if ( formatUnsupported ) exit ( `The format "${chalk.bold ( formatUnsupported )}" is not supported, supported formats: ${formats.map ( format => `"${chalk.bold ( format )}"` ).join ( ', ' )}` );

    if ( !this.config.output.fontName ) exit ( 'You need to provide a valid font name' );

  }

  /* PATHS */

  pathsInit () {

    const { fonts: fontsDir, fontName } = this.config.output,
          tempDir = temp.mkdirSync ( 'icon-font-buildr' );

    this.paths = {
      cache: {
        root: tempDir,
        icons: this.config.output.icons || path.join ( tempDir, 'icons' ),
        fontSVG: path.join ( tempDir, `${fontName}.svg` ),
        fontTTF: path.join ( tempDir, `${fontName}.ttf` ),
        fontEOT: path.join ( tempDir, `${fontName}.eot` ),
        fontWOFF: path.join ( tempDir, `${fontName}.woff` ),
        fontWOFF2: path.join ( tempDir, `${fontName}.woff2` )
      },
      output: {
        fontSVG: path.join ( fontsDir, `${fontName}.svg` ),
        fontTTF: path.join ( fontsDir, `${fontName}.ttf` ),
        fontEOT: path.join ( fontsDir, `${fontName}.eot` ),
        fontWOFF: path.join ( fontsDir, `${fontName}.woff` ),
        fontWOFF2: path.join ( fontsDir, `${fontName}.woff2` )
      }
    };

    mkdirp.sync ( this.paths.cache.icons );
    mkdirp.sync ( fontsDir );

  }

  pathsReset () {

    del.sync ( this.paths.cache.root, { force: true } );

  }

  /* DOWNLOAD */

  async downloadIcons () {

    const downloaders = [this.downloadIconLocal.bind ( this ), this.downloadIconRemote.bind ( this )];

    await Promise.all ( Object.keys(this.config.icons).map(key => this.config.icons[key].src || key).map ( async icon => {

      const dst = path.join ( this.paths.cache.icons, `${icon}.svg` );

      let downloaded = false;

      for ( let si = 0, sl = this.config.sources.length; !downloaded && si < sl; si++ ) {

        const srcTokenized = this.config.sources[si],
              src = srcTokenized.replace ( '[icon]', icon );

        for ( let di = 0, dl = downloaders.length; !downloaded && di < dl; di++ ) {

          const downloader = downloaders[di];

          downloaded = await downloader ( src, dst );

        }

      }

      if ( !downloaded ) exit ( `The "${chalk.bold ( icon )}" icon has not been found in any of the sources` );

    }));

  }

  async downloadIconRemote ( src, dst ) {

    if ( !isUrl ( src ) ) return false;

    try {

      const {body} = await got ( src );

      fs.writeFileSync ( dst, body );

      console.log ( `Downloaded "${chalk.bold ( src )}"` );

      return true;

    } catch ( e ) {

      return false;

    }

  }

  downloadIconLocal ( src, dst ) {

    if ( !fs.existsSync ( src ) ) return false;

    copy ( src, dst );

    console.log ( `Copied "${chalk.bold ( src )}"` );

    return true;

  }

  /* ICONS */

  async getIcons () {

    const filePaths = ( await globby ( '*.svg', { cwd: this.paths.cache.icons, absolute: true } ) ).sort (), // Ensuring the order is fixed
          codepointStart = '\uE000'.charCodeAt ( 0 ), // Beginning of Unicode's private use area
          usedCodepoints: any = [],
          icons = {};

    let codepointOffset = 0;

    filePaths.forEach ( ( filePath, index ) => {
      const basename = path.basename ( filePath, path.extname ( filePath ) ),
            iconConfig = this.config.icons[basename];

      let codepoints = iconConfig.codepoints
      if(!codepoints) {
        codepoints = [];

        let codepoint;
        do { // let's find a free codepoint here
          codepoint = String.fromCharCode ( codepointStart + (codepointOffset++) )
        } while (usedCodepoints.indexOf(codepoint) !== -1);

        usedCodepoints.push(codepoint);
        codepoints.push(codepoint);
      }

      let glyphOutputIndex = 0; // tmp
      iconConfig.ligatures.forEach(ligature => { // we are guaranteed to have at least one
        codepoints.forEach(codepoint => {
          const codepointHex = codepoint.charCodeAt ( 0 ).toString ( 16 ),
                name = `${iconConfig.name}-${glyphOutputIndex}`,
                icon = Object.assign( iconConfig, { filePath, name: name, codepoint, codepointHex, ligature } );

          delete icon.codepoints;
          delete icon.ligatures;

          icons[name] = icon;
        });
      });
    });

    console.log(icons)
    console.log('####')
    return icons;

  }

  async getIconsCodepoints ( hex = false ) {

    const icons = await this.getIcons (),
          values = Object.values ( icons ) as any[]; //TSC

    return values.reduce ( ( acc, icon ) => {

      acc[icon.name] = hex ? icon.codepointHex : icon.codepoint;

      return acc;

    }, {} );

  }

  async getIconsLigatures () {

    const icons = await this.getIcons (),
          values = Object.values ( icons ) as any[]; //TSC

    return values.reduce ( ( acc, icon ) => {

      acc[icon.name] = icon.ligature;

      return acc;

    }, {} );

  }

  /* BUILD */

  async build  () {

    this.pathsInit ();

    await this.downloadIcons ();

    await this.buildFontSVG ();
    await this.buildFontTTF ();
    await this.buildFontEOT ();
    await this.buildFontWOFF ();
    await this.buildFontWOFF2 ();

    this.outputFonts ();

    this.pathsReset ();

  }

  async buildFontSVG () {

    const icons = await this.getIcons ();

    const stream = new svg2font ({
      centerHorizontally: true,
      fontHeight: 4096,
      fontName: this.config.output.fontName,
      normalize: true
    });

    stream.pipe ( fs.createWriteStream ( this.paths.cache.fontSVG ) );

    Object.values ( icons ).forEach ( ( icon: any ) => { //TSC

      const glyph: any = fs.createReadStream ( icon.filePath ), //TSC
            unicode: string[] = [];

      if ( this.config.output.codepoints ) unicode.push ( icon.codepoint );
      if ( this.config.output.ligatures ) unicode.push ( icon.ligature );

      glyph.metadata = {
        unicode,
        name: icon.name
      };

      stream.write ( glyph );

    });

    stream.end ();

  }

  async buildFontTTF () {

    await execa ( 'npx', ['svg2ttf', this.paths.cache.fontSVG, this.paths.cache.fontTTF] );

  }

  async buildFontEOT () {

    await execa ( 'npx', ['ttf2eot', this.paths.cache.fontTTF, this.paths.cache.fontEOT] );

  }

  async buildFontWOFF () {

    await execa ( 'npx', ['ttf2woff', this.paths.cache.fontTTF, this.paths.cache.fontWOFF] );

  }

  async buildFontWOFF2 () {

    const ttf = fs.readFileSync ( this.paths.cache.fontTTF ),
          woff2 = ttf2woff2 ( ttf );

    fs.writeFileSync ( this.paths.cache.fontWOFF2, woff2 );

  }

  /* OUTPUT */

  outputFonts () {

    this.config.output.formats.forEach ( format => {

      const src = this.paths.cache[`font${format.toUpperCase ()}`],
            dst = this.paths.output[`font${format.toUpperCase ()}`];

      copy ( src, dst );

    });

  }

}

/* EXPORT */

export default IconFontBuildr;
