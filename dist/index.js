"use strict";
/* IMPORT */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var chalk_1 = require("chalk");
var del = require("del");
var execa = require("execa");
var fs = require("fs");
var globby = require("globby");
var got = require("got");
var isUrl = require("is-url");
var mkdirp = require("mkdirp");
var path = require("path");
var svg2font = require("svgicons2svgfont");
var temp = require("temp");
var ttf2woff2 = require("ttf2woff2");
var copy_1 = require("./copy");
var exit_1 = require("./exit");
var make_abs_1 = require("./make_abs");
temp.track();
/* ICON FONT BUILDR */
//TODO: Add support for font ligatures
var IconFontBuildr = /** @class */ (function () {
    /* CONSTRUCTOR */
    function IconFontBuildr(config) {
        this.configInit(config);
        this.configCheck();
    }
    /* CONFIG */
    IconFontBuildr.prototype.configInit = function (config) {
        this.configDefault = {
            sources: [],
            icons: [],
            output: {
                icons: undefined,
                fonts: path.join(process.cwd(), 'icon_font'),
                fontName: 'IconFont',
                formats: [
                    'eot',
                    'ttf',
                    'woff',
                    'woff2'
                ]
            }
        };
        this.config = _.mergeWith({}, this.configDefault, config, function (prev, next) { return _.isArray(next) ? next : undefined; });
        this.config.sources = this.config.sources.map(make_abs_1.default);
        this.config.output.icons = make_abs_1.default(this.config.output.icons);
        this.config.output.fonts = make_abs_1.default(this.config.output.fonts);
    };
    IconFontBuildr.prototype.configCheck = function () {
        if (!this.config.sources.length)
            exit_1.default('You need to provide at least one source, both remote and local sources are supported');
        var sourceUntokenized = this.config.sources.find(function (source) { return !source.includes('[icon]'); });
        if (sourceUntokenized)
            exit_1.default("The \"" + chalk_1.default.bold(sourceUntokenized) + "\" source doesn't include the \"" + chalk_1.default.bold('[icon]') + "\" token");
        if (!this.config.icons.length)
            exit_1.default('You need to provide at least one icon');
        var formats = this.configDefault.output.formats;
        if (!this.config.output.formats.length)
            exit_1.default("You need to provide at least one format, supported formats: " + formats.map(function (format) { return "\"" + chalk_1.default.bold(format) + "\""; }).join(', '));
        var formatUnsupported = this.config.output.formats.find(function (format) { return !formats.includes(format); });
        if (formatUnsupported)
            exit_1.default("The format \"" + chalk_1.default.bold(formatUnsupported) + "\" is not supported, supported formats: " + formats.map(function (format) { return "\"" + chalk_1.default.bold(format) + "\""; }).join(', '));
        if (!this.config.output.fontName)
            exit_1.default('You need to provide a valid font name');
    };
    /* PATHS */
    IconFontBuildr.prototype.pathsInit = function () {
        var _a = this.config.output, fontsDir = _a.fonts, fontName = _a.fontName, tempDir = temp.mkdirSync('icon-font-buildr');
        this.paths = {
            cache: {
                root: tempDir,
                icons: this.config.output.icons || path.join(tempDir, 'icons'),
                fontSVG: path.join(tempDir, fontName + ".svg"),
                fontTTF: path.join(tempDir, fontName + ".ttf"),
                fontEOT: path.join(tempDir, fontName + ".eot"),
                fontWOFF: path.join(tempDir, fontName + ".woff"),
                fontWOFF2: path.join(tempDir, fontName + ".woff2")
            },
            output: {
                fontSVG: path.join(fontsDir, fontName + ".svg"),
                fontTTF: path.join(fontsDir, fontName + ".ttf"),
                fontEOT: path.join(fontsDir, fontName + ".eot"),
                fontWOFF: path.join(fontsDir, fontName + ".woff"),
                fontWOFF2: path.join(fontsDir, fontName + ".woff2")
            }
        };
        mkdirp.sync(this.paths.cache.icons);
        mkdirp.sync(fontsDir);
    };
    IconFontBuildr.prototype.pathsReset = function () {
        del.sync(this.paths.cache.root, { force: true });
    };
    /* DOWNLOAD */
    IconFontBuildr.prototype.downloadIcons = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var downloaders;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        downloaders = [this.downloadIconLocal.bind(this), this.downloadIconRemote.bind(this)];
                        return [4 /*yield*/, Promise.all(this.config.icons.map(function (icon) { return __awaiter(_this, void 0, void 0, function () {
                                var dst, downloaded, si, sl, srcTokenized, src, di, dl, downloader;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            dst = path.join(this.paths.cache.icons, icon + ".svg");
                                            downloaded = false;
                                            si = 0, sl = this.config.sources.length;
                                            _a.label = 1;
                                        case 1:
                                            if (!(!downloaded && si < sl)) return [3 /*break*/, 6];
                                            srcTokenized = this.config.sources[si], src = srcTokenized.replace('[icon]', icon);
                                            di = 0, dl = downloaders.length;
                                            _a.label = 2;
                                        case 2:
                                            if (!(!downloaded && di < dl)) return [3 /*break*/, 5];
                                            downloader = downloaders[di];
                                            return [4 /*yield*/, downloader(src, dst)];
                                        case 3:
                                            downloaded = _a.sent();
                                            _a.label = 4;
                                        case 4:
                                            di++;
                                            return [3 /*break*/, 2];
                                        case 5:
                                            si++;
                                            return [3 /*break*/, 1];
                                        case 6:
                                            if (!downloaded)
                                                exit_1.default("The \"" + chalk_1.default.bold(icon) + "\" icon has not been found in any of the sources");
                                            return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    IconFontBuildr.prototype.downloadIconRemote = function (src, dst) {
        return __awaiter(this, void 0, void 0, function () {
            var body, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!isUrl(src))
                            return [2 /*return*/, false];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, got(src)];
                    case 2:
                        body = (_a.sent()).body;
                        fs.writeFileSync(dst, body);
                        console.log("Downloaded \"" + chalk_1.default.bold(src) + "\"");
                        return [2 /*return*/, true];
                    case 3:
                        e_1 = _a.sent();
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    IconFontBuildr.prototype.downloadIconLocal = function (src, dst) {
        if (!fs.existsSync(src))
            return false;
        copy_1.default(src, dst);
        console.log("Copied \"" + chalk_1.default.bold(src) + "\"");
        return true;
    };
    /* ICONS */
    IconFontBuildr.prototype.getIcons = function () {
        return __awaiter(this, void 0, void 0, function () {
            var filePaths, codepointStart, icons;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, globby('*.svg', { cwd: this.paths.cache.icons, absolute: true })];
                    case 1:
                        filePaths = (_a.sent()).sort(), codepointStart = '\uE000', icons = {};
                        filePaths.forEach(function (filePath, index) {
                            var name = path.basename(filePath, path.extname(filePath)), codepoint = String.fromCharCode(codepointStart.charCodeAt(0) + index), codepointHex = codepoint.charCodeAt(0).toString(16);
                            icons[filePath] = { filePath: filePath, name: name, codepoint: codepoint, codepointHex: codepointHex };
                        });
                        return [2 /*return*/, icons];
                }
            });
        });
    };
    IconFontBuildr.prototype.getIconsCodepoints = function (hex) {
        if (hex === void 0) { hex = false; }
        return __awaiter(this, void 0, void 0, function () {
            var icons, values;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getIcons()];
                    case 1:
                        icons = _a.sent(), values = Object.values(icons);
                        return [2 /*return*/, values.reduce(function (acc, icon) {
                                acc[icon.name] = hex ? icon.codepointHex : icon.codepoint;
                                return acc;
                            }, {})];
                }
            });
        });
    };
    /* BUILD */
    IconFontBuildr.prototype.build = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.pathsInit();
                        return [4 /*yield*/, this.downloadIcons()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.buildFontSVG()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.buildFontTTF()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.buildFontEOT()];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.buildFontWOFF()];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.buildFontWOFF2()];
                    case 6:
                        _a.sent();
                        this.outputFonts();
                        this.pathsReset();
                        return [2 /*return*/];
                }
            });
        });
    };
    IconFontBuildr.prototype.buildFontSVG = function () {
        return __awaiter(this, void 0, void 0, function () {
            var icons, stream;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getIcons()];
                    case 1:
                        icons = _a.sent();
                        stream = new svg2font({
                            centerHorizontally: true,
                            fontHeight: 4096,
                            fontName: this.config.output.fontName,
                            normalize: true
                        });
                        stream.pipe(fs.createWriteStream(this.paths.cache.fontSVG));
                        Object.values(icons).forEach(function (icon) {
                            var glyph = fs.createReadStream(icon.filePath); //TSC
                            glyph.metadata = {
                                unicode: [icon.codepoint],
                                name: icon.name
                            };
                            stream.write(glyph);
                        });
                        stream.end();
                        return [2 /*return*/];
                }
            });
        });
    };
    IconFontBuildr.prototype.buildFontTTF = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, execa('npx', ['svg2ttf', this.paths.cache.fontSVG, this.paths.cache.fontTTF])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    IconFontBuildr.prototype.buildFontEOT = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, execa('npx', ['ttf2eot', this.paths.cache.fontTTF, this.paths.cache.fontEOT])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    IconFontBuildr.prototype.buildFontWOFF = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, execa('npx', ['ttf2woff', this.paths.cache.fontTTF, this.paths.cache.fontWOFF])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    IconFontBuildr.prototype.buildFontWOFF2 = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ttf, woff2;
            return __generator(this, function (_a) {
                ttf = fs.readFileSync(this.paths.cache.fontTTF), woff2 = ttf2woff2(ttf);
                fs.writeFileSync(this.paths.cache.fontWOFF2, woff2);
                return [2 /*return*/];
            });
        });
    };
    /* OUTPUT */
    IconFontBuildr.prototype.outputFonts = function () {
        var _this = this;
        this.config.output.formats.forEach(function (format) {
            var src = _this.paths.cache["font" + format.toUpperCase()], dst = _this.paths.output["font" + format.toUpperCase()];
            copy_1.default(src, dst);
        });
    };
    return IconFontBuildr;
}());
/* EXPORT */
exports.default = IconFontBuildr;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLFlBQVk7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFWiwwQkFBNEI7QUFDNUIsK0JBQTBCO0FBQzFCLHlCQUEyQjtBQUMzQiw2QkFBK0I7QUFDL0IsdUJBQXlCO0FBQ3pCLCtCQUFpQztBQUNqQyx5QkFBMkI7QUFDM0IsOEJBQWdDO0FBQ2hDLCtCQUFpQztBQUNqQywyQkFBNkI7QUFDN0IsMkNBQTZDO0FBQzdDLDJCQUE2QjtBQUM3QixxQ0FBdUM7QUFDdkMsK0JBQTBCO0FBQzFCLCtCQUEwQjtBQUMxQix1Q0FBaUM7QUFFakMsSUFBSSxDQUFDLEtBQUssRUFBRyxDQUFDO0FBRWQsc0JBQXNCO0FBRXRCLHNDQUFzQztBQUV0QztJQU1FLGlCQUFpQjtJQUVqQix3QkFBYyxNQUFPO1FBRW5CLElBQUksQ0FBQyxVQUFVLENBQUcsTUFBTSxDQUFFLENBQUM7UUFDM0IsSUFBSSxDQUFDLFdBQVcsRUFBRyxDQUFDO0lBRXRCLENBQUM7SUFFRCxZQUFZO0lBRVosbUNBQVUsR0FBVixVQUFhLE1BQU87UUFFbEIsSUFBSSxDQUFDLGFBQWEsR0FBRztZQUNuQixPQUFPLEVBQUUsRUFBRTtZQUNYLEtBQUssRUFBRSxFQUFFO1lBQ1QsTUFBTSxFQUFFO2dCQUNOLEtBQUssRUFBRSxTQUFTO2dCQUNoQixLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBRyxPQUFPLENBQUMsR0FBRyxFQUFHLEVBQUUsV0FBVyxDQUFFO2dCQUNoRCxRQUFRLEVBQUUsVUFBVTtnQkFDcEIsT0FBTyxFQUFFO29CQUNQLEtBQUs7b0JBQ0wsS0FBSztvQkFDTCxNQUFNO29CQUNOLE9BQU87aUJBQ1I7YUFDRjtTQUNGLENBQUM7UUFFRixJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUcsRUFBRSxFQUFFLElB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