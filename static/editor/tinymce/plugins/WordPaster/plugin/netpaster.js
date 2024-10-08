(function () {
    'use strict';
    var global = tinymce.util.Tools.resolve('tinymce.PluginManager');
    function selectLocalImages(editor) {        
      WordPaster.getInstance().SetEditor(editor);
      WordPaster.getInstance().UploadNetImg()
    }

    var register$1 = function (editor) {
      editor.ui.registry.addButton('netpaster', {
        text: '<img src="/static/WordPaster/plugin/net.png"/>',
        tooltip: '网络图片一键上传',
        onAction: function () {
          selectLocalImages(editor)
        }
      });
      editor.ui.registry.addMenuItem('netpaster', {
        text: '<img src="/static/WordPaster/plugin/net.png"/>',
        tooltip: '网络图片一键上传',
        onAction: function () {
          selectLocalImages(editor)
        }
      });
    };
    var Buttons = { register: register$1 };
    function Plugin () {
      global.add('netpaster', function (editor) {        
        Buttons.register(editor);
      });
    }
    Plugin();
}());