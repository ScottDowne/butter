// PLUGIN: html5Player

(function ( Popcorn ) {

  Popcorn.plugin( "html5Player", {
    manifest: {
      about: {
        name: "Popcorn Maker html5 Player Plugin"
      },
      options: {
        start: {
          elem: "input",
          type: "number",
          label: "In",
          "units": "seconds"
        },
        end: {
          elem: "input",
          type: "number",
          label: "Out",
          "units": "seconds"
        },
        source: {
          elem: "input",
          type: "url",
          label: "Media Source URL"
        },
        starttime: {
          elem: "input",
          type: "number",
          label: "Start Time",
          "units": "seconds"
        },
        mute: {
          hidden: true
        },
        zindex: {
          hidden: true
        }
      }
    },

    _setup: function( options ) {

      options._video = document.createElement( "video" );
      options._video.classList.add( "html5-player" );
      options._video.style.zIndex = +options.zindex;

      options._target = Popcorn.dom.find( options.target );

      options._video.addEventListener( "loadedmetadata", function ( e ) {
        options._video.currentTime = options.starttime || 0;
      }, false );

      options._video.src = options.source;
      options._target.appendChild( options._video );

      options._startEvent = function() {};
      options._timeupdateEvent = function() {};
      options._pauseEvent = function() {};
      options._playEvent = function() {};
    },

    start: function( event, options ) {

      var paused = this.paused();

      options._startEvent = function() {
        if ( !paused ) {
          options._video.play();
        }
      };

      options._playEvent = function() {
        if ( paused ) {
          options._video.play();
        }
      };

      options._pauseEvent = function() {
        if ( !paused ) {
          options._video.pause();
        }
      };

      options._timeupdateEvent = function() {
        if ( false ) {
          
        }
      };

      options._video.classList.add( "html5-player-on" );
      options._video.classList.remove( "html5-player-off" );

      options._video.addEventListener( "timeupdate", options._timeupdateEvent, false );
      options._video.addEventListener( "pause", options._playEvent, false );
      options._video.addEventListener( "play", options._pauseEvent, false );

      if ( options._video.readyState >= 1 ) {
        options._startEvent();
      } else {
        this.pause();
        options._video.addEventListener( "loadedmetadata", options._startEvent, false );
      }
      
    },

    end: function( event, options ) {
      options._video.removeEventListener( "timeupdate", options._timeupdateEvent, false );
      options._video.removeEventListener( "loadedmetadata", options._startEvent, false );
      options._video.removeEventListener( "play", options._playEvent, false );
      options._video.removeEventListener( "pause", options._pauseEvent, false );
      options._video.classList.add( "html5-player-off" );
      options._video.classList.remove( "html5-player-on" );
    },
    
    _teardown: function( options ) {
      if ( options._video && options._target ) {
        options._target.removeChild( options._video );
      }
    }
  });
}( Popcorn ));
