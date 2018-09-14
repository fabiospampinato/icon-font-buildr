"use strict";
/* IMPORT */
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = require("chalk");
/* EXIT */
function exit(message, code) {
    if (code === void 0) { code = 0; }
    console.log(chalk_1.default.red(message));
    process.exit(code);
}
/* EXPORT */
exports.default = exit;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhpdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9leGl0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQSxZQUFZOztBQUVaLCtCQUEwQjtBQUUxQixVQUFVO0FBRVYsY0FBZ0IsT0FBTyxFQUFFLElBQVE7SUFBUixxQkFBQSxFQUFBLFFBQVE7SUFFL0IsT0FBTyxDQUFDLEdBQUcsQ0FBRyxlQUFLLENBQUMsR0FBRyxDQUFHLE9BQU8sQ0FBRSxDQUFFLENBQUM7SUFFdEMsT0FBTyxDQUFDLElBQUksQ0FBRyxJQUFJLENBQUUsQ0FBQztBQUV4QixDQUFDO0FBRUQsWUFBWTtBQUVaLGtCQUFlLElBQUksQ0FBQyJ9