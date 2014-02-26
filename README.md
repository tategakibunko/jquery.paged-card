# jquery.paged-card.js

## Summary

Convert target into paged-media card.

Not only horizontal but also vertical format is supported.

See [demo](http://tategakibunko.github.io/jquery.paged-card.js/).

## Prerequisites

- [jquery.js](http://jquery.com/)
- [underscore.js](http://underscorejs.org/)
- [backgone.js](http://backbonejs.org/)
- [nehan.js](http://tategakibunko.github.io/nehan.js/)

## Install

```html
<!-- stylesheets -->
<link href="/path/to/nehan.css" type="text/css" rel="stylesheet">
<link href="/path/to/jquery.paged-card.css" type="text/css" rel="stylesheet">
<link href="//cdnjs.cloudflare.com/ajax/libs/font-awesome/4.0.3/css/font-awesome.min.css" rel="stylesheet">

<!-- javascripts -->
<script src="/path/to/jquery.js" type="text/javascript"></script>
<script src="/path/to/underscore.js" type="text/javascript"></script>
<script src="/path/to/backbone.js" type="text/javascript"></script>
<script src="/path/to/nehan.js" type="text/javascript"></script>
<script src="/path/to/jquery.paged-card.js" type="text/javascript"></script>
```

## Usage

```html
<!-- horizontal card -->
<div class="foo" data-title="card1" data-font-size="16" data-width="640" data-height="480" data-direction="hori">
  some horizontal text here
</div>

<!-- vertical card -->
<div class="foo" data-title="card2" data-font-size="16" data-width="640" data-height="480" data-direction="vert">
  some vertical text here
</div>

<!-- javascript -->
<script type="text/javascript">
$(function(){
  $(".foo").pagedCard();
});
</script>
```

## Options

See [document](http://tategakibunko.github.io/jquery.paged-card.js).

## Support

IE9+(IE8 maybe), Firefox3.5+, Chrome4+, Safari5+, Opera10+

## License

MIT

