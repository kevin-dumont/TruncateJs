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
        return new Truncate(options, $(this));
    };

    function Truncate(data, element) {
        this.jQueryObject = element;
        this.elements = [];
        this.data = jQuery.extend(true, defaultOptions, data);
        this.stringHelper = new StringHelper();
        this.init();
    }

    Truncate.prototype = {
        init: function () {
            this._destroy = false;
            this.initElements();
            this.hideOverflowContent();
            this.bindEvents();
        },
        bindEvents: function () {

            var instance = this;

            if (this.data.refreshOnWindowResize) {

                var resizeTimer;

                $(window).on('resize', function (event) {

                    if (this._destroy) {
                        $(this).unbind(event);
                        event.prevendDefault();
                    }

                    clearTimeout(resizeTimer);
                    resizeTimer = setTimeout(function () {
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

                    this.addCss(i);
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
                            test = this.stringHelper.trim(test, ['.', ' ']) + this.data.suffix;

                            if (!this.checkIfHeightWordIsTooLongForElement(test, i)) {
                                finalText += ' ' + word;
                            } else {
                                break;
                            }
                        }
                    }
                    finalText = this.stringHelper.trim(finalText, [' ', '.']);

                    // If the text need to truncate
                    if (finalText.split(' ').length != this.elements[i].originalContent.split(' ').length) {
                        finalText += this.data.suffix;
                    }
                    this.setTextToElement(i, finalText);
                }
            }
        },
        addCss: function (elementIndex) {

            if (this.elements[elementIndex].cssAlreadyAdded) {
                return;
            }

            this.elements[elementIndex].cssAlreadyAdded = true;
            this.elements[elementIndex].originalCss = {};

            if (this.data.breakWords) {
                var wordBreak = this.elements[elementIndex].jQueryObject.css('word-break');
                var hyphens = this.elements[elementIndex].jQueryObject.css('hyphens');
                this.elements[elementIndex].originalCss['word-break'] = wordBreak ? wordBreak : '';
                this.elements[elementIndex].originalCss['hyphens'] = hyphens ? hyphens : '';
                this.elements[elementIndex].jQueryObject.css({
                    'word-break': 'break-all',
                    'hyphens': 'auto'
                });
            }

            if (this.data.overflowHidden) {
                var overflow = this.elements[elementIndex].jQueryObject.css('overflow');
                this.elements[elementIndex].originalCss['overflow'] = overflow ? overflow : '';
                this.elements[elementIndex].jQueryObject.css('overflow', 'hidden');
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
                originalContent: this.stringHelper.trim(jQueryObject.html(), ['\r\n', '\n', '\r', ' '])
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

            while (this.checkIfWidthWordIsTooLongForElement(word + this.data.suffix, indexOfElement) && maxIteration > 0) {
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
            var attribute = 'overflow' + this.stringHelper.capitalize(type);

            if (this.elements[indexOfElement][attribute]) {
                this.elements[indexOfElement].jQueryObject.html(oldHtm);
                return true;
            }
            this.elements[indexOfElement].jQueryObject.html(oldHtm);
            return false;
        },
        destroy: function () {
            this.resetElements();
            this.elements = [];
            this.jQueryObject = [];
            this.data = [];
            this.stringHelper = null;
            this._destroy = true;
            return true;
        },
        resetCssForElement: function (elementIndex) {
            var that = this;

            if (typeof this.elements[elementIndex].originalCss != 'undefined') {
                $.each(this.elements[elementIndex].originalCss, function (property, value) {
                    that.elements[elementIndex].jQueryObject.css(property, value);
                });
            }
        },
        resetElements: function () {
            for (var i = 0; i < this.elements.length; i++) {
                this.resetCssForElement(i);
                this.setTextToElement(i, this.elements[i].originalContent);
            }
        },
        getItemByJqueryObject: function (jqueryElement) {
            for (var i = 0; i < this.elements.length; i++) {
                if (jqueryElement == this.elements[i].jQueryObject.get(0)) {
                    return this.elements[i];
                }
            }
            return false;
        }
    };

    function StringHelper() {
    }

    StringHelper.prototype = {
        capitalize: function (str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        },
        trim: function (str, chars) {
            return this.leftTrim(this.rightTrim(str, chars), chars);
        },
        leftTrim: function (str, chars) {
            chars = chars || "\\s";
            return str.replace(new RegExp("^[" + chars + "]+", "g"), "");
        },
        rightTrim: function (str, chars) {
            chars = chars || "\\s";
            return str.replace(new RegExp("[" + chars + "]+$", "g"), "");
        }
    };

}(jQuery));
