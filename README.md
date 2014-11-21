Radio player on HTML5 of Tyumen's stations
==========================================

About
-----

This made for the project where I'm working now.
That module is use list of radiostations of Tyumen city but you may replace
this list on your own. Need observe format of JSON.

Module is using HTML5 Javascript API but there is fallback to Flash
if browser not support that API.

Example
-------

You may to see it in work at: http://www.pixel-tyumen.ru/works/html5-radio/

Use
---

You may place it on your own page just set in HTML-file:
```html
<head>
    ...
    <link rel="stylesheet" href="css/bootstrap.min.css">
    <link rel="stylesheet" href="css/bootstrap-responsive.min.css">
    <link rel="stylesheet" href="css/html5-radio.css">
    ...
</head>
<body>
    ...
    <div id="radio-ui-container">
        <div class="btn-group">
            <a class="btn dropdown-toggle btn-mini" data-toggle="dropdown" href="#" id="current-radio-container">
                <span id="current-radio">Станция</span>
                <span class="caret"></span>
            </a>
            <ul class="dropdown-menu" id="radio-list"></ul>
        </div>
        <a id="radio-play" href="#" class="btn btn-info btn-mini"><i class="icon-play"></i></a>
        <div id="radio-volume" class="progress"><div class="bar"></div></div>
        <a id="radio-mute" href="#" class="btn btn-info btn-mini"><i class="icon-volume-off"></i></a>
        <audio id="radio-player"></audio>
        <div id="radio-fallback-container">
            <div id="radio-fallback"></div>
        </div>
    </div>
    ...
    <script src="js/vendor/swfobject.js"></script>
    <script src="js/vendor/jquery-1.9.1.min.js"></script>
    <script src="js/vendor/underscore.min.js"></script>
    <script src="js/vendor/backbone.min.js"></script>
    <script src="js/vendor/bootstrap.min.js"></script>
    <script src="js/html5-radio.js"></script>
    <script>
        $( function () { new RadioPlayer.Application().run(); });
    </script>
</body>
```

Also you need files in `img` folder of this project. And `js/stations.json`.
