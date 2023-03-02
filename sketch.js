var panelHeight = 512,
    panelWidth;
  
var borderWidth = 4,
    borderRadius = 50;
  
var font = "Georgia",
    fontSize = 16,
    textOffset = 30;

var imageDir = "images";

var imageNames = [
  ["DRAGON Bad.png", "DRAGON GOOD.png", "DRAGON HAPPY.png", "DRAGON Okay.png"],
  ["Prince Bad.png", "Prince Good.png", "Prince OK.png", "Prince Very good.png"],
  ["Princess Happy.png", "Princess Ok.png", "Princess Unhappy.png", "Princess Very Happy.png"]
];

var numPanels = 3,
    panels = [];

function preload() {
  // Create panels
  for (var i = 0; i < numPanels; i++) {
    // Add panel
    panels.push({
      images: [],
      x: borderWidth,
      y: borderWidth + i * (panelHeight + borderWidth) 
    });
    
    var p = panels[i];
    
    // Add images
    imageNames.forEach(function(d) {
      // Flip a coin for inclusion
      if (Math.random() >= 0.5) {
        // Roll a die for which image
        var j = randomInteger(d.length);
        
        // Add image object
        p.images.push(createImage(d[j]));
      }
    });
    
    // Check for at least one image
    if (p.images.length === 0) {
      // Pick an image
      var j = randomInteger(imageNames.length),
          k = randomInteger(imageNames[j].length);
        
      // Add image object
      p.images.push(createImage(imageNames[j][k]));
    }
  }
  
  function randomInteger(n) {
    return Math.floor(Math.random() * n);
  }
  
  function createImage(imageName) {
    return {
      image: loadImage(imageDir + "/" + imageName),
      text: ""
    };
  }
}

function setup() {      
  // Get maximum image height
  var maxHeight = panels.reduce(function(p, c) { 
    var h = c.images.reduce(function(p, c) { 
      var h = c.image.height;
      
      return h > p ? h : p;
    }, 0);
    
    return h > p ? h : p;
  }, 0);
  
  // Height scale to apply to all images
  var scale = (panelHeight - textOffset) / maxHeight;
  
  // Resize images and set positions
  panels.forEach(function(d) {
    var x = 0;
    d.images.forEach(function(d) {
      // Get image
      var im = d.image;
      
      // Resize to fit vertically
      var newHeight = Math.floor(im.height * scale),
          aspect = im.width / im.height;
          
      im.resize(Math.floor(newHeight * aspect), newHeight);
      
      // Set position
      d.x = x;
      d.y = textOffset + Math.floor((panelHeight - textOffset - im.height) / 2);
      
      // Add width to offset
      x += im.width;
    });
  });
  
  // Get maximum panel width
  panelWidth = panels.reduce(function(p, c) { 
    var w = c.images.reduce(function(p, c) { 
      return p + c.image.width;
    }, 0);
    
    return w > p ? w : p;
  }, 0);
    
  // Create the canvas
  createCanvas(panelWidth + borderWidth * 2, 
               panelHeight * panels.length + borderWidth * (panels.length + 1));  
               
  // Text parameters
  textSize(fontSize);
  textFont(font);
  
  // Button callbacks
  document.getElementById("refresh").onclick = function() {
    location.reload();
  };
  
  document.getElementById("save").onclick = function() {
    save();
  };
}

// Timer for text input marker
var timer,
    marker;

function draw() {  
  // Timer
  var t = millis();
  if (t - timer > 500) {
    marker = !marker;
    timer = t;
  }
  
  // Clear
  background("white");
  
  // Draw panels
  panels.forEach(function(d) {
    // Transform panel
    resetMatrix();
    translate(d.x, d.y);
    
    // Set up text drawing
    fill(0);
    noStroke();
    
    // Draw images
    d.images.forEach(function(d) {
      // Translate image
      push();
      translate(d.x, d.y);
      
      // Draw image
      image(d.image);
      
      // Get text
                  
      if (currentImage && d === currentImage) {
        // Use blend to highlight
        blend(d.image, 0, 0, d.image.width, d.image.height, 0, 0, d.image.width, d.image.height, OVERLAY);
        
        // Add marker to text
        if (marker) {
          textAlign(LEFT);
          text("|", d.image.width / 2 + textWidth(d.text) / 2, -2); 
        }
      }  
      
      // Draw text      
      textAlign(CENTER);
      text(d.text, d.image.width / 2, 0); 
      
      pop();
    });
    
    // Draw border 
    var br = borderRadius,    
        bw = borderWidth;
        
    noFill();   
    stroke(0); 
    strokeWeight(bw);

    rect(-bw / 2, -bw / 2, panelWidth + bw - 1, panelHeight + bw, 
         br, br, br, br);         
  });
}

function keyPressed() {  
  // Use keyPressed for special characters
  if (keyCode === 8 || keyCode === 46) {
    // Backspace or delete, remove the character at the end
    currentImage.text = currentImage.text.slice(0, -1);
    
    return false;
  }
}

function keyTyped() {
  // Use keyTyped for normal characters
  if (currentImage) {
    // Add character
    currentImage.text += key;
    
    return false;
  }
}

// Variables for mouse interaction
var oldMouseX = 0,
    oldImageX = 0,
    currentImage = null;
  
function mousePressed() {
  if (currentImage) {
    // Move current image to end of image array so it is rendered on top
    for (var i = 0; i < panels.length; i++) {
      var p = panels[i];

      for (var j = 0; j < p.images.length - 1; j++) {
        var im = p.images[j];

        if (im === currentImage) {
          p.images.push(p.images.splice(j, 1)[0]);
        }
      }
    }
  }
}
  
function mouseMoved() {
  // Intersect with images
  for (var i = 0; i < panels.length; i++) {
    var p = panels[i];
    
    // Reverse order, so top image is found first
    for (var j = p.images.length - 1; j >= 0; j--) {    
      var im = p.images[j];
      
      if (intersectImage(mouseX - p.x, mouseY - p.y, im)) {     
        if (currentImage !== im) {
          // Start timer for text marker
          timer = millis();
          marker = true;
        }
        
        // Save state
        currentImage = im;
        oldMouseX = mouseX;
        oldImageX = currentImage.x;

        return;
      }
    }    
  }
  
  // No intersection
  currentImage = null;
}

function mouseDragged() {
  if (currentImage) {
    // Update image
    currentImage.x = oldImageX + mouseX - oldMouseX;
    
    // Constrain
    var w = currentImage.image.width;
    currentImage.x = currentImage.x < 0 ? 0 : 
                     currentImage.x > panelWidth - w ? panelWidth - w : 
                     currentImage.x;
  }
}

function intersectImage(x, y, image) {
  // Check image bounding box
  if (x >= image.x && 
      x <= image.x + image.image.width &&
      y >= image.y &&
      y <= image.y + image.image.height ) {
      
    // Check pixel within image
    return image.image.get(x - image.x, y - image.y)[3] > 0;
  }         
}