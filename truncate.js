"use strict";

(function ($) {

    var defaultOptions = {
        breakWords: false,
        overflowHidden: true,
        refreshOnWindowResize: true,
        suffix: '...',
        maximumWordLenght: 255,
        refreshResizeDelay: 50
    };

    $.fn.truncate = function (options) {
        new Truncate(options, $(this));
    };

    function Truncate(data, element) {
        this.jQueryObject = element;
        this.elements = [];
        this.data = jQuery.extend(true, defaultOptions, data);
        this.init();
    }

    Truncate.prototype = {
        init: function () {
            this.initElements();
            this.hideOverflowContent();
            this.bindEvents();
        },
        bindEvents: function () {

            var instance = this;

            if (this.data.refreshOnWindowResize) {

                var resizeTimer;

                $(window).on('resize', function () {

                    clearTimeout(resizeTimer);
                    resizeTimer = setTimeout(function(){
                        instance.refreshElements();
                        instance.hideOverflowContent(true);
                    }, instance.data.refreshResizeDelay);
                });
            }
        },
        initElements: function () {
            var instance = this;
            this.jQueryObject.each(function (index, element) {
                instance.elements.push(instance.getInfoElement(element));
            });
        },
        hideOverflowContent: function (forceRefresh) {

            for (var i = 0; i < this.elements.length; i++) {

                var contentOverflow = this.elements[i].overflowWidth || this.elements[i].overflowHeight;

                if (contentOverflow || forceRefresh) {

                    this.addCss(this.elements[i].jQueryObject);
                    var text = this.elements[i].originalContent;
                    var words = text.split(" ");
                    this.elements[i].jQueryObject.html('');
                    var finalText = '';

                    for (var j = 0; j < words.length; j++) {

                        var word = this.getTruncatedWordForElement(words[j], i);

                        if (j == 0) {
                            finalText = word;
                        } else {
                            var test = finalText + ' ' + word;
                            test = test.trim(['.', ' ']) + this.data.suffix;

                            if (!this.checkIfHeightWordIsTooLongForElement(test, i)) {
                                finalText += ' ' + word;
                            } else {
                                break;
                            }
                        }
                    }
                    finalText = finalText.trim([' ', '.']);

                    // If the text need to truncate
                    if (finalText != this.elements[i].originalContent) {
                        finalText += this.data.suffix;
                    }
                    this.setTextToElement(i, finalText);
                }
            }
        },
        addCss: function (element) {
            if (this.data.breakWords) {
                element.css({
                    'word-break': 'break-all',
                    'hyphens': 'auto'
                });
            }

            if (this.data.overflowHidden) {
                element.css('overflow', 'hidden');
            }
        },
        setTextToElement: function (indexOfElement, text) {
            this.elements[indexOfElement].jQueryObject.html(text);
            this.refreshElement(indexOfElement);
            return this;
        },
        refreshElement: function (index) {
            this.elements[index].scrollWidth = this.elements[index].element.scrollWidth;
            this.elements[index].innerWidth = this.elements[index].jQueryObject.innerWidth();
            this.elements[index].scrollHeight = this.elements[index].element.scrollHeight;
            this.elements[index].innerHeight = this.elements[index].jQueryObject.innerHeight();
            this.elements[index].overflowWidth = this.elements[index].scrollWidth >
                this.elements[index].jQueryObject.innerWidth();
            this.elements[index].overflowHeight = this.elements[index].scrollHeight >
                this.elements[index].jQueryObject.innerHeight();
            return this;
        },
        getInfoElement: function (element) {
            var jQueryObject = $(element);
            var object = {
                jQueryObject: jQueryObject,
                element: element,
                scrollWidth: element.scrollWidth,
                innerWidth: jQueryObject.innerWidth(),
                scrollHeight: element.scrollHeight,
                innerHeight: jQueryObject.innerHeight(),
                originalContent: jQueryObject.html().trim('\r\n', '\n', '\r', ' ')
            };
            object.overflowWidth = object.scrollWidth > object.jQueryObject.innerWidth();
            object.overflowHeight = object.scrollHeight > object.jQueryObject.innerHeight();
            return object;
        },
        refreshElements: function () {
            for (var i = 0; i < this.elements.length; i++) {
                this.refreshElement(i);
            }
        },
        getTruncatedWordForElement: function (word, indexOfElement) {
            var tooLong = false;
            var maxIteration = this.data.maximumWordLenght;

            while (this.checkIfWidthWordIsTooLongForElement(word + this.data.suffix, indexOfElement) &&  maxIteration > 0) {
                tooLong = true;
                word = word.substr(0, word.length - 1);
                maxIteration--;
            }
            if (tooLong) {
                return word + this.data.suffix;
            }
            return word;
        },
        checkIfWidthWordIsTooLongForElement: function (word, indexOfElement) {
            return this.checkIfSizeWordIsTooLongForElement('width', word, indexOfElement);
        },
        checkIfHeightWordIsTooLongForElement: function (word, indexOfElement) {
            return this.checkIfSizeWordIsTooLongForElement('height', word, indexOfElement);
        },
        checkIfSizeWordIsTooLongForElement: function (type, word, indexOfElement) {
            var oldHtm = this.elements[indexOfElement].jQueryObject.html();
            this.setTextToElement(indexOfElement, word);
            var attribute = 'overflow' + type.capitalize();

            if (this.elements[indexOfElement][attribute]) {
                this.elements[indexOfElement].jQueryObject.html(oldHtm);
                return true;
            }
            this.elements[indexOfElement].jQueryObject.html(oldHtm);
            return false;
        }
    };

}(jQuery));

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.trimLeft = function(charlist) {
    if (charlist === undefined) {
        charlist = "\s";
    }
    return this.replace(new RegExp("^[" + charlist + "]+"), "");
};

String.prototype.trimRight = function(charlist) {
    if (charlist === undefined) {
        charlist = "\s";
    }
    return this.replace(new RegExp("[" + charlist + "]+$"), "");
};

String.prototype.trim = function(charlist) {
    return this.trimLeft(charlist).trimRight(charlist);
};
