(function () {
    'use strict';
    var global = tinymce.util.Tools.resolve('tinymce.PluginManager');
    function selectLocalImages(editor) {        
      WordPaster.getInstance().SetEditor(editor);
      WordPaster.getInstance().importPPT()
    }

    var register$1 = function (editor) {
      editor.ui.registry.addButton('pptimport', {
        text: '<img src="/static/WordPaster/plugin/ppt.png"/>',
        tooltip: 'PowerPoint一键导入',
        onAction: function () {
          selectLocalImages(editor)
        }
      });
      editor.ui.registry.addMenuItem('pptimport', {
        text: '<img src="/static/WordPaster/plugin/ppt.png"/>',
        tooltip: 'PowerPoint一键导入',
        onAction: function () {
          selectLocalImages(editor)
        }
      });
    };
    var Buttons = { register: register$1 };
    function Plugin () {
      global.add('pptimport', function (editor) {        
        Buttons.register(editor);
      });
    }
    Plugin();
}());