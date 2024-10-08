(function () {
    'use strict';
    var global = tinymce.util.Tools.resolve('tinymce.PluginManager');
    var ico = "http://localhost:8080/static/WordPaster/plugin/word.png"
    function selectLocalImages(editor) {
      WordPaster.getInstance().SetEditor(editor);
      WordPaster.getInstance().PasteManual()
    }

    var register$1 = function (editor) {
      editor.ui.registry.addButton('wordpaster', {
        text: '<img src="/static/WordPaster/plugin/word.png"/>',
        tooltip: 'Word一键粘贴',
        onAction: function () {
          selectLocalImages(editor)
        }
      });
      editor.ui.registry.addMenuItem('wordpaster', {
        text: '<img src="/static/WordPaster/plugin/word.png"/>',
        tooltip: 'Word一键粘贴',
        onAction: function () {
          selectLocalImages(editor)
        }
      });
    };
    var Buttons = { register: register$1 };
    function Plugin () {
      global.add('wordpaster', function (editor) {        
        Buttons.register(editor);
      });
    }
    Plugin();
}());