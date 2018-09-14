"use strict";
/* IMPORT */
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
/* COPY */
function copy(src, dst) {
    var content = fs.readFileSync(src);
    fs.writeFileSync(dst, content);
}
/* EXPORT */
exports.default = copy;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29weS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jb3B5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQSxZQUFZOztBQUVaLHVCQUF5QjtBQUV6QixVQUFVO0FBRVYsY0FBZ0IsR0FBRyxFQUFFLEdBQUc7SUFFdEIsSUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBRyxHQUFHLENBQUUsQ0FBQztJQUV4QyxFQUFFLENBQUMsYUFBYSxDQUFHLEdBQUcsRUFBRSxPQUFPLENBQUUsQ0FBQztBQUVwQyxDQUFDO0FBRUQsWUFBWTtBQUVaLGtCQUFlLElBQUksQ0FBQyJ9