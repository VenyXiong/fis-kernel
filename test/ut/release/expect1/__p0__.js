define(\'photo:widget/comp/comp.js\', [], function(require, exports, module){\n\nexports.name = \'comp\';\nconsole.log(\'comp loaded\');\n\n});define(\'photo:widget/list/list.js\', [\'photo:widget/comp/comp.js\'], function(require, exports, module){\n\nvar comp = require(\'photo:widget/comp/comp.js\');\nconsole.log(comp);\nexports.name = \'list\';\nconsole.log(\'list loaded\');\n\n});