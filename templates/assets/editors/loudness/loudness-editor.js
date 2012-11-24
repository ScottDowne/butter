/* This Source Code Form is subject to the terms of the MIT license
 * If a copy of the MIT license was not distributed with this file, you can
 * obtain one at https://raw.github.com/mozilla/butter/master/LICENSE */

(function( Butter ) {

  Butter.Editor.register( "loudness", "load!{{baseDir}}templates/assets/editors/loudness/loudness-editor.html",
    function( rootElement, butter, compiledLayout ) {

    var _this = this;

    var _rootElement = rootElement,
        _trackEvent,
        _butter,
        _popcornOptions,
        _falseClick = function() {
          return false;
        },
        _trueClick = function() {
          return true;
        },
        noAnimate = {
          start: 1,
          end: 1,
          target: 1,
          container: 1
        };

    /**
     * Member: setup
     *
     * Sets up the content of this editor
     *
     * @param {TrackEvent} trackEvent: The TrackEvent being edited
     */
     //todo: figure out why this is running twice
    function setup( trackEvent ) {
      _trackEvent = trackEvent;
      _popcornOptions = _trackEvent.popcornOptions;

      var basicContainer = _rootElement.querySelector( ".editor-options" ),
          advancedContainer = _rootElement.querySelector( ".advanced-options" ),
          pluginOptions = {},
          pickers = {},
          keyframes = [ 0 ];

      function callback( elementType, element, trackEvent, name ) {
        //todo: see if we're at a keyframe and animate
        pluginOptions[ name ] = {
          element: element,
          trackEvent: trackEvent,
          elementType: elementType,
          opts: trackEvent.manifest.options && trackEvent.manifest.options[ name ] || {}
        };
      }

      function updateKeyframeList() {
        var i,
          key,
          frame,
          prop,
          zero = keyframes.length && keyframes[ 0 ] === 0;

        for ( key in _popcornOptions ) {
          prop = _popcornOptions[ key ];
          if ( !noAnimate[ key ] && pluginOptions[ key ].opts.animate !== false
            && !( prop instanceof HTMLElement ) ) {

            if ( prop && typeof prop === 'object') {
              for ( frame in prop ) {
                if ( frame === 'from' ) {
                  frame = 0;
                } else if ( frame === 'to' ) {
                  frame = 1;
                }
                if ( !isNaN( frame ) ) {
                  i = keyframes.indexOf( frame );
                  if ( i < 0 ) {
                    keyframes.push( frame );
                  }
                }
              }
            } else if ( prop !== undefined && prop !== null && !zero ) {
              keyframes.shift( 0 );
            }
          }

        }
        keyframes.sort();

        //todo: redraw keyframe timeline
      }

      function attachHandlers() {
        var key,
            option;

        function updateTrackEventSafe( trackEvent, properties ) {
          updateKeyframeList();
          _this.updateTrackEventSafe( trackEvent, properties );
        }

        function checkboxCallback( trackEvent, prop, updateOptions ) {
          if ( "background shadow".match( prop ) ) {
            if ( updateOptions[ prop ] ) {
              pickers[ prop ].classList.remove( "butter-disabled" );
              pickers[ prop ].onclick = _trueClick;
              pickers[ prop ].removeAttribute("disabled");
            } else {
              pickers[ prop ].classList.add( "butter-disabled" );
              pickers[ prop ].onclick = _falseClick;
              pickers[ prop ].setAttribute( "disabled", "true" );
            }
          }
          trackEvent.update( updateOptions );
        }

        for ( key in pluginOptions ) {
          if ( pluginOptions.hasOwnProperty( key ) ) {
            option = pluginOptions[ key ];

            if ( option.elementType === "select" ) {
              _this.attachSelectChangeHandler( option.element, option.trackEvent, key, updateTrackEventSafe );
            }
            else if ( option.elementType === "input" ) {
              if ( !isNaN( option.opts.min ) && option.opts.max > option.opts.min ) {
                option.element.setAttribute( "type", "range" );
                option.element.setAttribute( "min", option.opts.min );
                option.element.setAttribute( "max", option.opts.max );
                option.element.setAttribute( "step", option.opts.step || ( option.opts.max - option.opts.min ) / 100 );
              }

              _this.attachInputChangeHandler( option.element, option.trackEvent, key, updateTrackEventSafe );
            }

            if ( !noAnimate[ key ] && option.opts.animate !== false ) {

            }
          }
        }

        basicContainer.insertBefore( _this.createStartEndInputs( trackEvent, _this.updateTrackEventSafe ), basicContainer.firstChild );
      }

      /*
      // backwards comp
      if ( "center left right".match( _popcornOptions.position ) ) {
        _popcornOptions.alignment = _popcornOptions.position;
        _popcornOptions.position = "middle";
      }
      */

      trackEvent.subscribe( "update", function( notification ) {
        var changes = notification.data;
        //todo: restore keyframe objects and set data. do not cancel
      });

      _this.createPropertiesFromManifest({
        trackEvent: trackEvent,
        callback: callback,
        basicContainer: basicContainer,
        advancedContainer: advancedContainer,
        ignoreManifestKeys: [ "start", "end" ]
      });

      attachHandlers();
      _this.updatePropertiesFromManifest( trackEvent );
      _this.setTrackEventUpdateErrorCallback( _this.setErrorState );

      updateKeyframeList();
    }

    function onTrackEventUpdated( e ) {
      _trackEvent = e.target;

      _this.updatePropertiesFromManifest( _trackEvent );
      _this.setErrorState( false );
    }

    // Extend this object to become a TrackEventEditor
    Butter.Editor.TrackEventEditor.extend( _this, butter, rootElement, {
      open: function( parentElement, trackEvent ) {
        _butter = butter;

        // Update properties when TrackEvent is updated
        trackEvent.listen( "trackeventupdated", onTrackEventUpdated );
        setup( trackEvent );
      },
      close: function() {
        _trackEvent.unlisten( "trackeventupdated", onTrackEventUpdated );
      }
    });
  });
}( window.Butter ));
