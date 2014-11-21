/**
 * Радио плеер
 * @requires    jQuery, underscore, backbone, twitter-bootstrap, swfobject
 */

var RadioPlayer = {};

RadioPlayer.DEBUG = false;

RadioPlayer.Station = Backbone.Model.extend({
    defaults: {
        id: '',
        active: false,
        title: '',
        freq: 0,
        website: '',
        logo: '',
        desc: '',
        defaultStream: '',
        streams: null
    },
    getDefaultStream: function () {
        var streams = this.get('streams'),
            defaultStreamKey = this.get('defaultStream');
        if (defaultStreamKey) {
            return streams.get(defaultStreamKey);
        } else {
            return streams.at(0);
        }
    }
});

RadioPlayer.Stream = Backbone.Model.extend({
    defaults: {
        id: '',
        ogg: '',
        mp3: '',
        bitrate: 0
    }
});

RadioPlayer.Stations = Backbone.Collection.extend({
    model: RadioPlayer.Station,
    comparator : 'freq'
});

RadioPlayer.Streams = Backbone.Collection.extend({
    model: RadioPlayer.Stream
});

RadioPlayer.FlashPlayer = function (options) {

    var _self = this,
        _options = options || {},
        _swfId = 'radio-fallback',
        _swfUrl = _options.swf || './img/radio.swf',
        //_swfUrl = './img/radio.swf?=' + +new Date(),
        _expressInstallUrl = _options.expressInstall || './img/expressInstall.swf',
        _swf;

    _self.volume = 0;

    _self.isDefined = function () {
        return _swf.source;
    };

    _self.play = function () {
        _swf.play();
    };

    _self.pause = function () {
        _swf.pause();
    };

    _self.setAttribute = function (name, value) {
        _swf.source(value);
    };

    _self.setVolume = function (value) {
        _self.volume = value;
        _swf.volume(value);
    };

    (function () {
        swfobject.embedSWF(
            _swfUrl,
            _swfId,
            '320px', '240px',
            '10.3.0',
            _expressInstallUrl,
            {},
            {},
            {
                id : _swfId
            },
            function () {
                _swf = $('#' + _swfId).get(0);
            }
        );
    })();

};

RadioPlayer.Application = function (options) {
    var _self = this,
        _isHtml5 = true,
        _defaultVolume = 1,
        _state = {
            isPlaying : true,
            volume : _defaultVolume,
            radio  : null
        },
        _options = options || {},
        _container = $('#radio-ui-container'),
        _dataUrl = _options.dataUrl || './js/html5-radio-data.json',
        _tryies = 0,
        _audio, _data, _current;

    _self.run = function () {//window.localStorage.removeItem('mt-radio');
        _plugIn();
        _initUI();
        $.ajax({
            async : false,
            dataType : 'json',
            success : function (result) {
                _procData(result);
            },
            error : function () {
                _errorHandler('Application.run.ajax', arguments);
            },
            url : _dataUrl
        });
        _setData();
        _onAfterLoad();
    };

    _self.print = function () {
        console.dir(_data.toJSON());
    };

    var _plugIn = function () {
        _audio = _container.find('#radio-player').get(0);
        if (!_audio.canPlayType || !_audio.canPlayType('audio/mpeg')) {
            _errorHandler('Application._plugIn', 'HTML5 audio/mpeg not supported');
            _isHtml5 = false;
            _audio = new RadioPlayer.FlashPlayer(_options);
        }
    };

    var _onAfterLoad = function () {
        if (!_isHtml5 && !_audio.isDefined()) {
            _.delay(_onAfterLoad, 250);
            if (++_tryies > 50) {
                alert('Ваш браузер не поддерживает воспроизведение звука или оно отключено.');
            }
            return;
        }
        _setHandlers();
        _loadState();
        _route();
    };

    var _route = function () {
        var hash = window.location.hash.substr(1);
        if (hash && !_state.radio) {
            _setCurrent( _data.get( hash ) );
        }
    };

    var _initUI = function () {
        _container.find('#radio-volume .bar').css('width', (_defaultVolume * 100) + '%');
    };

    var _errorHandler = function (callable_name, data) {
        if (RadioPlayer.DEBUG) {
            console.info(arguments);
        }
    };

    var _procData = function (raw_data) {
        _data = new RadioPlayer.Stations();
        _.each(raw_data, function (radio) {
            if (!radio.active || !radio.streams.length) {
                _errorHandler('Application._procData', radio.title);
                return;
            }
            var streams = new RadioPlayer.Streams();
            _.each(radio.streams, function (item) {
                streams.add(new RadioPlayer.Stream(item));
            });
            radio.streams = streams;
            _data.add(new RadioPlayer.Station(radio));
        });
    };

    var _setData = function () {
        _data.each(function (item) {
            _container.find('#radio-list').append(
                $('<li/>').append(
                    $('<a/>').attr('href', '#' + item.get('id')).text(item.get('title'))
                )
            );
        });
    };

    var _setHandlers = function () {
        _container.find('#radio-list').on('click', 'a', function () {
            _setCurrent( _data.get( $(this).attr('href').substr(1) ) );
        });
        _container.on('click', '#radio-play', function (e) {
            e.preventDefault();
            if (!_current) {
                return;
            }
            _play();
        });
        _container.on('click', '#radio-stop', function (e) {
            e.preventDefault();
            if (!_current) {
                return;
            }
            _stop();
        });
        _container.on('click', '#radio-mute', function (e) {
            e.preventDefault();
            if (!_current) {
                return;
            }
            _mute();
        });
        _container.on('click', '#radio-unmute', function (e) {
            e.preventDefault();
            if (!_current) {
                return;
            }
            _unmute();
        });
        _container.find('#radio-volume').on('mouseup', function (e) {
            if (!_current) {
                return;
            }
            var val = (e.pageX - $('#radio-volume').offset().left) / $('#radio-volume').width();
            if (val > .95) {
                val = 1;
            } else if (val < .05) {
                val = 0;
            }
            _volume(val);
        });
        $(window).on('unload', function (e) {
            _audio.pause();
        });
    };

    var _play = function () {
        _audio.play();
        _state.isPlaying = true;
        _saveState();
        $('#radio-play').attr('id', 'radio-stop')
            .find('.icon-play').attr('class', 'icon-stop');
    };

    var _stop = function () {
        _audio.pause();
        _state.isPlaying = false;
        _saveState();
        $('#radio-stop').attr('id', 'radio-play')
            .find('.icon-stop').attr('class', 'icon-play');
    };

    var _setCurrent = function (current) {
        if (!current) {
            _current = null;
            alert('Такое радио отсутствует!');
            return;
        }
        _current = current;
        _state.radio = _current.get('id');
        _saveState();
        $('#current-radio').text(_current.get('title'));
        _audio.setAttribute('src', _current.getDefaultStream().get('mp3'));
        if (_state.isPlaying) {
            _play();
        }
    };

    var _volume = function (value) {
        value = parseFloat(value);
        if (!isNaN(value)) {
            value = Math.max(0, Math.min(value, 1));
            if (_isHtml5) {
                _audio.volume = value;
            } else {
                _audio.setVolume(value);
            }
            _state.volume = value;
            _saveState();
            _container.find('#radio-volume .bar').css(
                'width', parseInt(value * 100, 10) + '%'
            );
        }
        return _audio.volume;
    };

    var _mute = function () {
        _volume(0);
        $('#radio-mute').attr('id', 'radio-unmute')
            .find('.icon-volume-off').attr('class', 'icon-volume-up');
    };

    var _unmute = function () {
        _volume(_defaultVolume);
        $('#radio-unmute').attr('id', 'radio-mute')
            .find('.icon-volume-up').attr('class', 'icon-volume-off');
    };

    var _saveState = function () {
        if (window.localStorage) {
            window.localStorage.setItem('mt-radio', JSON.stringify(_state));
        }
    };

    var _loadState = function () {
        if (window.localStorage) {
            var state = JSON.parse( window.localStorage.getItem('mt-radio') );
            if (state) {
                _state = state;
                if (_state.radio) {
                    _setCurrent( _data.get( _state.radio ) );
                    try {
                        window.history.pushState({}, '', '#' + _state.radio);
                    } catch (err) {}
                }
                _state.isPlaying ? _play() : _stop();
            }
        }
        if (!_state.volume) {
            _mute();
        } else {
            _volume(_state.volume);
        }
    };

    var _clearState = function () {
        _state = {
            isPlaying : true,
            volume : _defaultVolume,
            radio  : null
        };
        _saveState();
    };

};
