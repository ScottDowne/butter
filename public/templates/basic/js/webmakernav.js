(function() {
  var myProjectsButton = document.querySelector( ".my-projects-title" ),
      closeButton = document.querySelector( ".my-projects-close" ),
      iframe = document.querySelector( ".my-projects-iframe" ),
      myProjectIframeContainer = document.querySelector( ".my-projects-container" ),
      editorContainer,
      bodyWrapper;

  function open() {
    myProjectsButton.addEventListener( "click", close, false );
    myProjectsButton.removeEventListener( "click", open, false );
      editorContainer = document.querySelector( ".butter-editor-area" );
      bodyWrapper = document.querySelector( ".body-wrapper" );

    //friendlyCodeToolbar = document.querySelector( ".friendlycode-toolbar" );
    //friendlyCodePanes = document.querySelector( ".friendlycode-panes" );
    myProjectIframeContainer.classList.remove( "hidden" );
    editorContainer.classList.add( "expanded" );
    bodyWrapper.classList.add( "expanded" );
    //friendlyCodePanes.classList.add( "expanded" );

    iframe.src = "/myprojects";
  }

  function close() {
    myProjectsButton.addEventListener( "click", open, false );
    myProjectsButton.removeEventListener( "click", close, false );
      editorContainer = document.querySelector( ".butter-editor-area" );
      bodyWrapper = document.querySelector( ".body-wrapper" );

    myProjectIframeContainer.classList.add( "hidden" );
    editorContainer.classList.remove( "expanded" );
    bodyWrapper.classList.remove( "expanded" );
    //friendlyCodeToolbar = document.querySelector( ".friendlycode-toolbar" );
    //friendlyCodePanes = document.querySelector( ".friendlycode-panes" );
    //friendlyCodeToolbar.classList.remove( "expanded" );
    //friendlyCodePanes.classList.remove( "expanded" );
  }

  myProjectsButton.addEventListener( "click", open, false );
}());
