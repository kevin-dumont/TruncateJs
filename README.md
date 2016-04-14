# TruncateJS, a jQuery plugin to truncate() all

TruncateJS is a jQuery plugin to truncate too long texts.
It is based on the size of HTML elements.
Thus, content which overflow its container will be cut.

## Demo

You can see the result on JSFiddle [here](https://jsfiddle.net/sygmaa/p25ekqna/).

## Documentation

### How to install TruncateJs ?

Very **simple**, it's only a jQuery plugin, **no CSS needed**.
So, you just have to load the script as following :

```html
<script type="text/javascript" src="https://cdn.rawgit.com/sygmaa/TruncateJs/master/truncate.min.js"></script>
```

> **Notes :**
> 
> - Don't forget to load jQuery before the truncateJs script.
> - We recommand to place it before the end of the body tag.

### How to use it ?

Suppose you have a blog article like that :


```html
<article>
    <div class="title">A too long title for its container</div>
    <img src="a-sublime-image.png" alt="A sublime image">
    <a href="/link-to-article.html" class="read-more">Read more</a>
</article>
```

And suppose we have this CSS :

```css
article {
    width: 100px;
}

article .title {
    display: inline-block;
    height: 26px;
    line-height: 26px;
}
```

The text has a longer size than 100px, its tag `.title` can not contain 2 lines, because of its `line-height` and `height` properties. To enhance the display, you can use the truncate plugin with the following :

```javascript
$('article .title').truncate();
```
And that's all !

### Options

You can specify more options to customize the display :

```javascript
$('article .title').truncate(
    // Add the css property word-break: break-all;
    breakWords: false,

    // Add the css property overflow: hidden;
    overflowHidden: true,

    // Recalculate when the window is resized
    refreshOnWindowResize: true,
 
	// The delay for recalculate after resizing window
    refreshResizeDelay: 50
    
    // Suffix at the end of the truncated text
    suffix: '...',

	// A word will be cut if it contain more than 255 caracters
    maximumWordLenght: 255,
);
```
> **Note :** All described options are default options.

## License
TruncateJs in under a [MIT License](https://opensource.org/licenses/MIT).

## Report a bug
If you discover any bug, please use the issues tracker.
