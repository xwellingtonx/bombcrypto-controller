var controlleId = "bombcryptoController";
var cssFileName = "controller";
var deadzone = 0.5;
var isUsingAnalog = false;
var keydownInterval = null;
var lastKeyCode = null;
var gameIframe = null;

if(document.getElementById(controlleId)) {
  document.getElementById(controlleId).remove();
  unloadCSS();
} else {
  loadCSS();
  var div = document.createElement("div"); 
  div.setAttribute("id", controlleId);
  div.innerHTML = createControls();
  document.body.appendChild(div); 

  var rootElement = document.querySelector("#root");
  gameIframe = rootElement.querySelector("iframe");
  if(gameIframe) {
	console.log("Game Iframe found");
	console.log(gameIframe);
  }

  document.getElementById("bombButton").addEventListener("mousedown", (event) => {
	event.preventDefault();
    placeBomb();
  });

  document.getElementById("analogContainer").addEventListener("mousedown", (event) => {
	event.preventDefault();
    isUsingAnalog = true;
  });

  document.getElementById("analogContainer").addEventListener("touchstart", (event) => {
	event.preventDefault();
    isUsingAnalog = true;
  });

  document.getElementById("analogContainer").addEventListener("mousemove", (event) => {
	event.preventDefault();
    moveHero(event, event.currentTarget);
  });

  document.getElementById("analogContainer").addEventListener("touchmove", (event) => {
	event.preventDefault();
    moveHero(event, event.currentTarget);
  });
  
  document.getElementById("analogContainer").addEventListener("touchend", (event) => {
	event.preventDefault();
    isUsingAnalog = false;
    dispatchKeyupEvent();
    resetAnalogStick(event.currentTarget);
  });

  document.addEventListener("mouseup", (event) => {
	event.preventDefault();
    isUsingAnalog = false;
    dispatchKeyupEvent();
    resetAnalogStick(event.currentTarget);
  });
}


function loadCSS() {
  var link = document.createElement("link");
  link.href = chrome.runtime.getURL(cssFileName + ".css");
  link.id = cssFileName;
  link.type = "text/css";
  link.rel = "stylesheet";
  document.getElementsByTagName("head")[0].appendChild(link);
}
  
function unloadCSS() {
  var cssNode = document.getElementById(cssFileName);
  cssNode && cssNode.parentNode.removeChild(cssNode);
}

function createControls() {
  return `<div class="bombcrypt-controls">` +
    '<div id="donation"><label>Donations: 0xE7538a878E4448Fb9111a7B539835A4b89Ae4c33</label></div>' +
    createAnalog() +
    createButtom() +
  '</div>'
}

function createAnalog() {
    return '<div id="analogContainer">' +
    '<svg class="analog-stick" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">' +
      '<circle class="white" cx="12" cy="12" r="6"/>' +
    '</svg>' +
    '<svg class="analog-background" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">' +
      '<circle class="dark-orange" cx="12" cy="12" r="12"/>' +
      '<circle class="yellow" cx="12" cy="12" r="11"/>' +
    '</svg>' +
  '</div>'
}

function createButtom() {
  return '<div id="bombButton">' +
    '<svg id="b-button" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" style="user-select: none;">' +
    '<g>' +
    '<circle class="dark-orange" cx="12" cy="12" r="12"/>' +
    '<circle class="yellow" cx="12" cy="12" r="11"/>' +
    '</g>' +
    '<path class="white" d="M16.79,11.54V8.77H15.44V7.39H7.19V17h8.22V15.66h1.38v-3H15.41V11.54ZM14,15.66H9.92v-3H14Zm-4.1-4.12V8.77H14v2.77Z"/>' +
    '</svg>' +
  '</div>'
}

function moveHero(event, containerElement) {
  if(isUsingAnalog) {
    var analogStickElement = containerElement.querySelector(".analog-stick");

    // Get our directional values
    const {rectCenterX, rectCenterY, touchX, touchY} = getDirectionalTouch(event, analogStickElement.parentElement.getBoundingClientRect());

    // Find our Horizontal Axis
    const horizontalDifferenceFromCenter = touchX - rectCenterX;
    var horizontalAxis = horizontalDifferenceFromCenter / rectCenterX;
    if (horizontalAxis > 1) {
      horizontalAxis = 1.0;
    } else if (horizontalAxis < -1) {
      horizontalAxis = -1.0;
    }

    // Find our Vertical Axis
    const verticalDifferenceFromCenter = touchY - rectCenterY;
    var verticalAxis = verticalDifferenceFromCenter / rectCenterY;
    if (verticalAxis > 1) {
      verticalAxis = 1.0;
    } else if (verticalAxis < -1) {
      verticalAxis = -1.0;
    }

    // Apply styles to element
    const translateX = (rectCenterX * horizontalAxis) / 2;
    const translateY = (rectCenterY * verticalAxis) / 2;
    analogStickElement.style.transform = `translate(${translateX}px, ${translateY}px)`;

    // LEFT, RIGHT
    if (Math.abs(horizontalAxis) > deadzone) {
      if (horizontalAxis > 0) {
        //Dispatch keydown event to key 'ArrowRight'
        dispatchKeydownEvent(39);
        //console.log("Debug: Move to RIGHT");
      } else if (horizontalAxis < 0) {
        //Dispatch keydown event to key 'ArrowLeft'
        dispatchKeydownEvent(37);
        //console.log("Debug: Move to LEFT");
      }
    }
    
    // UP, DOWN
    if (Math.abs(verticalAxis) > deadzone) {
      if (verticalAxis > 0) {       
        //Dispatch keydown event to key 'ArrowDown'
        dispatchKeydownEvent(40);
        //console.log("Debug: Move to DOWN");        
      } else if (verticalAxis < 0) {
        //Dispatch keydown event to key 'ArrowUp'
        dispatchKeydownEvent(38);
        //console.log("Debug: Move to UP");  
      }
    }
  }
}


function placeBomb() {
  //Dispatch Space keydown event
  gameIframe.contentDocument.body.focus();
  gameIframe.contentDocument.body.click();

  gameIframe.contentDocument.body.dispatchEvent(new KeyboardEvent('keydown', 
  {'keyCode':32,'key': 'Space', 'code': 'Space', 'bubbles': true, 'cancelable': true, 'composed': true, 'defaultPrevented':  true} )); //32 space
  
  gameIframe.contentDocument.body.dispatchEvent(new KeyboardEvent('keyup', 
	{'keyCode':32,'key': 'Space', 'code': 'Space', 'bubbles': true, 'cancelable': true, 'composed': true, 'defaultPrevented':  true} )); //32 space

  console.log("Debug: Placed bomb");
}

function resetAnalogStick(containerElement) {
  var analogStickElement = containerElement.querySelector(".analog-stick");
  analogStickElement.style.transform = `translate(0px, 0px)`;
}

function getDirectionalTouch(event, boundingClientRect) {
  var touch;
  if (event.type.includes('touch')) {
    touch = event.touches[0];
  } else if (event.type.includes('mouse')) {
    touch = event;
  }

  // We will need these  calculations for when if we are dpad or analog
  // Find our centers of our rectangles, and our unbiased X Y values on the rect
  const rectCenterX = (boundingClientRect.right - boundingClientRect.left) / 2;
  const rectCenterY = (boundingClientRect.bottom - boundingClientRect.top) / 2;
  const touchX = touch.clientX - boundingClientRect.left;
  const touchY = touch.clientY - boundingClientRect.top;

  return {
    rectCenterX,
    rectCenterY,
    touchX,
    touchY
  }
}

function dispatchKeydownEvent(keyCode) {

  if(keyCode != lastKeyCode) {
    dispatchKeyupEvent();

    gameIframe.contentDocument.body.focus();
	  gameIframe.contentDocument.body.click();
   
    gameIframe.contentDocument.body.dispatchEvent(new KeyboardEvent('keydown', {'keyCode':keyCode, 'bubbles': true, 'cancelable': true, 'composed': true, 'defaultPrevented':  true}  ));
    lastKeyCode = keyCode;

    console.log("Debug: KeyDownEvent " + keyCode);
  }
}

function dispatchKeyupEvent() {
  if(lastKeyCode != null) {
    gameIframe.contentDocument.body.dispatchEvent(new KeyboardEvent('keyup', {'keyCode':lastKeyCode, 'bubbles': true, 'cancelable': true, 'composed': true, 'defaultPrevented':  true}  ));
    lastKeyCode = null;
  }
}
