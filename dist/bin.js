#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var minimist = require("minimist");
var rdf = require("require-dot-file");
var _1 = require(".");
/* CONFIG */
var argv = minimist(process.argv.slice(2)), config = (argv.config && require(argv.config)) || rdf('icon_font.json', process.cwd()) || {};
/* ICON FONT BUILDR */
new _1.default(config).build();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmluLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2Jpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFLQSxtQ0FBcUM7QUFDckMsc0NBQXdDO0FBQ3hDLHNCQUErQjtBQUUvQixZQUFZO0FBRVosSUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFHLENBQUMsQ0FBRSxDQUFFLEVBQzVDLE1BQU0sR0FBRyxDQUFFLElBQUksQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFHLElBQUksQ0FBQyxNQUFNLENBQUUsQ0FBRSxJQUFJLEdBQUcsQ0FBRyxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsR0FBRyxFQUFHLENBQUUsSUFBSSxFQUFFLENBQUM7QUFFNUcsc0JBQXNCO0FBRXRCLElBQUksVUFBYyxDQUFHLE1BQU0sQ0FBRSxDQUFDLEtBQUssRUFBRyxDQUFDIn0=