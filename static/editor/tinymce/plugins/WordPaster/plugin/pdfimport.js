(function () {
    'use strict';
    var global = tinymce.util.Tools.resolve('tinymce.PluginManager');
    function selectLocalImages(editor) {        
      WordPaster.getInstance().SetEditor(editor);
      WordPaster.getInstance().ImportPDF()
    }

    var register$1 = function (editor) {
      editor.ui.registry.addButton('pdfimport', {
        text: '<img src="/static/WordPaster/plugin/pdf.png"/>',
        tooltip: '一键导入pdf',
        onAction: function () {
          selectLocalImages(editor)
        }
      });
      editor.ui.registry.addMenuItem('pdfimport', {
        text: '<img src="/static/WordPaster/plugin/pdf.png"/>',
        tooltip: '一键导入pdf',
        onAction: function () {
          selectLocalImages(editor)
        }
      });
    };
    var Buttons = { register: register$1 };
    function Plugin () {
      global.add('pdfimport', function (editor) {        
        Buttons.register(editor);
      });
    }
    Plugin();
}());