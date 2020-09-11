var JSV = (function () {
    var _containerId, _container, _context = {};

    return {
        init: init,
    };

    function init(id) {
        _containerId = id;
        _container = document.getElementById(id);
        mount(_container);
        return _context;
    }

    // ========================================================================

    function mount(element) {
        mountElement(element);
        if (element.children.length == 0) return;
        for (var i = 0; i < element.children.length; i++) {
            mount(element.children[i]);
        }
    }

    function mountElement(element) {
        var atts = element.attributes;

        var idAttr = atts['id'];
        if (idAttr) {
            if (_context[idAttr.value]) throw new Error('duplicate HTML element id: ' + idAttrr.value);
            _context[idAttr.value] = element;
        }
    }
})();