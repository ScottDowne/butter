// PLUGIN: SPEAK
// SPEAK.JS by @kripken https://github.com/kripken/speak.js

(function ( Popcorn ) {

/**
  Popcorn speak: speaks text
 */
  Popcorn.plugin( "speak", (function(){

    // Share a worker instance across instances to
    // relieve memory pressure.  When speakWorkerRefs
    // goes to 0, we can safely delete the instance.
    var speakWorker,
        speakWorkerRefs = 0;

    return {
      manifest: {
        about: {
          name: "Popcorn speak Plugin",
          version: "0.1",
          author: "Kate Hudson @k88hudson",
          website: "http://github.com/k88hudson"
        },
        options: {
          start: {
            elem: "input",
            type: "number",
            label: "In"
          },
          end: {
            elem: "input",
            type: "number",
            label: "Out"
          },
          text: {
            elem: "input",
            type: "text",
            label: "Text to speak:",
            "default": "Hello world"
          },
          showText: {
            elem: "input",
            type: "checkbox",
            label: "Show text?"
          },
          amplitude: {
            elem: "input",
            type: "text",
            label: "Amplitude:"
          },
          wordgap: {
            elem: "input",
            type: "number",
            label: "Wordgap:"
          },
          pitch: {
            elem: "input",
            type: "number",
            label: "Pitch:"
          },
          speed: {
            elem: "input",
            type: "number",
            label: "Speed:"
          },
          pluginPath: {
            elem: "input",
            type: "text",
            label: "Plugin path:",
            "default":"../shared/plugins/speak/",
            hidden: true
          }
        }
      },
      _setup: function( options ) {
        var target = options._target = document.getElementById( options.target ),
            speakOptions,
            context = this;

        if ( !target ) {
          target = document.createElement( "div" );
          target.id = options.target;
          context.media.parentNode.appendChild( target );
          console.log( target );
        }

        // Setup options needed for speak.js
        if( !options.pluginPath ) {
          options.pluginPath = "js/plugins/speak/";
        }

        // SPEAK.JS by @kripken https://github.com/kripken/speak.js ---------------------------
        if( !speakWorker ){
          try {
            speakWorker = new Worker( options.pluginPath + 'speakWorker.js' );
          } catch(e) {
            console.log( 'speak.js warning: no worker support' );
          }
        }

        // Bump instance count
        speakWorkerRefs++;

        function speak( text, args ) {
          // set to true if you want debug output on times.
          var PROFILE = false;

          function parseWav( wav ) {
            function readInt( i, bytes ) {
              var ret = 0,
                  shft = 0;

              while ( bytes ) {
                ret += wav[ i ] << shft;
                shft += 8;
                i++;
                bytes--;
              }
              return ret;
            }
            if ( readInt( 20, 2 ) !== 1 ) {
              throw 'Invalid compression code, not PCM';
            }
            if ( readInt( 22, 2 ) !== 1 ) {
              throw 'Invalid number of channels, not 1';
            }
            return {
              sampleRate: readInt( 24, 4 ),
              bitsPerSample: readInt( 34, 2 ),
              samples: wav.subarray( 44 )
            };
          }

          function playHTMLAudioElement( wav ) {
            function encode64( data ) {
              var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
                  PAD = '=',
                  ret = '',
                  leftchar = 0,
                  leftbits = 0,
                  i,
                  curr;
              for( i = 0; i < data.length; i++ ) {
                leftchar = ( leftchar << 8 ) | data[ i ];
                leftbits += 8;
                while ( leftbits >= 6 ) {
                  curr = ( leftchar >> ( leftbits-6 ) ) & 0x3f;
                  leftbits -= 6;
                  ret += BASE[ curr ];
                }
              }
              if (leftbits === 2) {
                ret += BASE[ ( leftchar&3 ) << 4 ];
                ret += PAD + PAD;
              } else if ( leftbits === 4 ) {
                ret += BASE[ ( leftchar&0xf ) << 2 ];
                ret += PAD;
              }
              return ret;
            }

            options._container = document.createElement( "div" );
            options._container.id = "container-" + Popcorn.guid();
            options._container.innerHTML=( "<audio id=\"" + Popcorn.guid() +
                                           "-player\" src=\"data:audio/x-wav;base64," +
                                           encode64( wav )+ "\">" );
            target.appendChild( options._container );
          }

          function handleWav( wav ) {
            var startTime = Date.now();
            var data = parseWav( wav ); // validate the data and parse it
            playHTMLAudioElement( wav );
            if ( PROFILE ) {
              console.log( 'speak.js: wav processing took ' + ( Date.now()-startTime ).toFixed( 2 ) + ' ms' );
            }
          }

          // Call the worker, which will return a wav that we then play
          var startTime = Date.now();
          speakWorker.onmessage = function( event ){
            if ( PROFILE ) {
              console.log( 'speak.js: worker processing took ' + ( Date.now()-startTime ).toFixed( 2 ) + ' ms' );
            }
            handleWav( event.data );
          };
          speakWorker.postMessage({ text: text, args: args });
        }

        // END SPEAK.JS---------------------------------------

        speakOptions = {};
        if( options.amplitude ){
          speakOptions.amplitude = options.amplitude;
        }
        if( options.wordgap ){
          speakOptions.wordgap = options.wordgap;
        }
        if( options.pitch ){
          speakOptions.pitch = options.pitch;
        }
        if( options.speed ){
          speakOptions.speed = options.speed;
        }
        speakOptions.target = options.target;

        if( options.text ){
          speak( options.text, speakOptions );
        }

        if( options.showText ) {
          options.showTextEl = document.createElement("span");
          options.showTextEl.innerHTML = options.text;
          options.showTextEl.style.display = "none";
          target.appendChild( options.showTextEl );
        }

        if( options.callback ){
          options.callback( options._container );
        }
      },

      start: function( event, options ) {
        if( options._container ){
          options._container.children[0].play();
        }
        if( options.showTextEl ){
          options.showTextEl.style.display = "block";
        }
      },

      end: function( event, options ) {
        if( options.showTextEl ){
          options.showTextEl.style.display = "none";
        }
      },

      _teardown: function( options ) {
        if( options._container && options._target ) {
          options._target.removeChild( options._container );
        }
        if( options.showTextEl && options._target ) {
          options._target.removeChild( options.showTextEl );
        }
        // Decrease ref count on shared worker, delete if 0
        if( --speakWorkerRefs === 0 ){
          speakWorker = null;
        }
      }

    };
  }()));
}( Popcorn ));