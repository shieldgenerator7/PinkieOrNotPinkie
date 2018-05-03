 //main.js

var width = 800,
height = 500,
savedPinkie,//the pinkie that you choose to save for later in the beginning
realPinkie,//the pinkie that is real
maxPinkies = 25,//the max amount of pinkies
realPinkieDeath = 0,//used to mark how far into the game the player killed the real pinkie
floorLine = height - 100,//the floor that the pinkies bounce on
hits = 0, hitsAttempted = 0,//amount of clicks on a pinkie, and amount of attempted clicks on a pinkie, during gameMode "play"
mouseX, mouseY,//stored mouse coordinates
gLoop,
c = document.getElementById('c'),
ctx = c.getContext('2d');

var modeTime = 0;//counts the amount of time in any one gameMode
var gameMode = "open";//play= playing game, gameover= pinkie died
//play: the player can shoot the pinkies
//transToSave: transition from play to chooseSave, Twilight calls "Order!"
//chooseSave: the player decides which pinkie to save
//gameOver: one pinkie left (?) undefined
//results: show the results of this game

c.width = width;
c.height = height;


//global variables used in randomly calculating Y spawn pos of pinkies
var min = 0;
var max = 364;

var backGroundImg = new Image();
backGroundImg.src = "bg_play.png";
var clear = function(){
	var img = new Image();
	img.src = "background.png";

	ctx.clearRect(0, 0, width, height);
	ctx.beginPath();
	ctx.rect(0, 0, width, height);
	ctx.closePath();
	//ctx.drawImage(img,0,0);
	ctx.drawImage(backGroundImg,0,0,width,height);

	// ctx.fillStyle = 'black';
	// ctx.font="20px Arial";
	// ctx.fillText("Score: " + score,0,480);
}

var switchGameMode = function(mode){
	gameMode = mode;
	modeTime = 0;
	crossHair.setImage(mode);
	distracted = -1;
	playerFired = false;
	for (var i = 0; i < howManyPinkies; i++){
		pinkieArray[i].direction = Math.random() * (3) - 1;
		pinkieArray[i].upVel = 0;
	}
}

//makes a button that switches gameModes when clicked
function Button(text, x, y, modeTo){
	var that = this;
	that.img = new Image();
	that.img.src = text+".png";
	that.X = x;
	that.Y = y;
	that.width = 100;//text.length + 20;
	that.height = 50;//30;
	that.text = text;
	that.modeTo = modeTo;
	that.mouseOver = false;
	
	//checks to see if it's been clicked
	that.checkClick = function(x, y, click){//copied from Pinkie.checkClick(..)
		that.mouseOver = false;
		that.img.src = text+".png";
			if (x > that.X){//mouse-button collision detection
				if (x < that.X + that.width){
					if (y > that.Y){
						if (y < that.Y + that.height){
							if (click){
								return that.onClick();
							}
							else
								that.onMouseOver();
						}
					}
				}
			}
		return false;//pinkie is not clicked on
	}
	//activates the button when clicked
	that.onClick = function(){
		if (that.modeTo){
			switchGameMode(that.modeTo);
		}
		return true;
	}
	//paints the button differently when moused over
	that.onMouseOver = function(){
		that.mouseOver = true;
		that.img.src = text+"_over.png";
	}
	//draws the button
	that.draw = function(){
		ctx.drawImage(that.img, that.X, that.Y, that.width, that.height);
		// ctx.strokeRect(that.X, that.Y, that.X + that.width, that.Y + that.height);
		// ctx.fillText(text, that.X + 10, that.Y + 5);
	}
}

// var MoveCircles = function(e){
// for (var i = 0; i < howManyCircles; i++) {
// if (circles[i][1] - circles[i][2] > height) {
// circles[i][0] = Math.random() * width;
// circles[i][2] = Math.random() * 100;
// circles[i][1] = 0 - circles[i][2];
// circles[i][3] = Math.random() / 2;
// }
// else {
// circles[i][1] += e;
// }
// }
// };

//
// Pinkie
//
//document.write("pinkie");
function Pinkie(){
	var that = this;
	that.image = new Image();
	that.markForDeletion = false;
	
	that.index = 0;//the index number that it is in the array

	//that.image.src = "target.png"
	that.image.src = "pinkie.png"
	that.width = 70;
	that.height = 70;
	that.frames = 0;
	that.actualFrame = 0;
	that.X = Math.floor(Math.random() * (max - min + 1)) + min;
	that.Y = Math.floor(Math.random() * (max - min + 1)) + min;//randomize y value on initialization
	
	that.direction = Math.floor(Math.random() * (1 - (-1) + 1)) + (-1);//the x direction the pinkie is going in
	that.upVel = 0;//the up velocity for which way it's moving. Negative values means it's going up
		
	that.setPosition = function(x, y){
		that.X = x;
		that.Y = y;
		if (savedPinkie != that){//boundary rules don't apply to saved Pinkie
			if (that.X < 0){
				that.X = 0;
				that.direction *= -1;
			}
			else if (that.X + that.width > width){
				that.X = width - that.width;
				that.direction *= -1;
			}
			if (that.Y < 0){
				that.Y = 0;
				that.upVal = 0;
			}
			else if (that.Y + that.height > floorLine){//height){
				that.Y = floorLine - that.height + 1;//height
				that.upVal = 0;
			}
		}
	}
	//returns the pinkie's index number + 1
	that.getNumber = function(){
		return that.index + 1;
	}
	//this method returns true if the pinkie is on the ground
	that.isOnGround = function(){
		return (that.Y + that.height >= floorLine);
	}
	// this method checks to see if this pinkie has been clicked on
	that.checkClick = function(x, y){
		if (!that.markForDeletion){//if pinkie is still alive
			if (x > that.X){//mouse-pinkie collision detection
				if (x < that.X + that.width){
					if (y > that.Y){
						if (y < that.Y + that.height){
							//if (savedPinkie != that){//if this pinkie is not the saved one
								return that.onClick();//it has been clicked on, and activated
								// return true;//pinkie is clicked on
							//}
						}
					}
				}
			}
		}
		return false;//pinkie is not clicked on
	}
	//Carry out onClick operations, depending on game state
	that.onClick = function(){
	//returns true as default unless otherwise specified
		switch (gameMode){
			case "play": 
				if (savedPinkie != that){
					that.hit(); 	
				}
				else return false;
				break;
			case "chooseSave": that.capture(); break;
		}
		return true;
	}
	//this makes pinkie decide what to do
	that.move = function(){
		if (gameMode == "play"){//if the game mode allows them to bounce
			if (savedPinkie != that){//if this pinkie is not the saved one
				that.bounce();
			}
		}
	}
	that.setDistracted = function(){
		if (realPinkie != that){// && savedPinkie != that){//QUERY: should the savedPinkie be allowed to get distracted?
			that.isDistracted = Math.floor(Math.random() * (3 - 0 + 1) + 0);
			if (that.isDistracted > 1)that.isDistracted = 0;//decreases the chances of a pinkie getting distracted
		}
		else that.isDistracted = 0;
	}
	//this method potentially distracts the pinkies
	that.distract = function(){
		if (that.isDistracted){
			var rx = Math.random() *20 - 10;
			var ry = Math.random() *20 - 10;
			that.setPosition(that.X + rx, that.Y + ry);
			// that.bounce();
		}
	}
	//this method makes the pinkie bounce excitedly
	that.bounce = function(){
		var dx = that.direction, dy = 0;//the total movement on each axis
		if (that.isOnGround()){
			that.upVel -= Math.random() * (32 - 0 + 1) + 0;
		}
		dy += that.upVel;
		that.upVel += 1;
		// else if (that.upVel >= 0){
			// dy += that.upVel;
			// that.upVel -= 1;
		// }
		// else if (that.upVel < 0){
			// dy += that.upVel;
			// that.upVel += 1;
		// }
				
		that.setPosition(that.X + dx, that.Y + dy);
		
	}
	
	// //when the pinkie is chosen to be saved
	that.capture = function(){
	//FUTURE CODE: set sprite variables
		//set position to bottom-left corner
		that.X = 10;
		that.Y = height - that.height - 10;
		//release prev saved pinkie
		if (savedPinkie && savedPinkie != that)
			savedPinkie.release();
		//capture current pinkie
		savedPinkie = that;
		switchGameMode("play");
	}
	
	that.release = function(){
		that.X = 0;
		that.Y = 0;
		// that.img.src = "pinkie.png";
		// that.width = 70;
		// that.height = 70;
		// that.frames = 0;
	}
	
	//when the pinkie is hit with magic blast
	that.hit = function(){
		hitPinkies++;
		hits += 1;
		that.remove();
	}
	
	//Function called when hit with magic blast
	that.remove = function(){
		that.markForDeletion = true;
		howManyPinkiesAlive -= 1;
		if (howManyPinkiesAlive <= 1){
			switchGameMode("results");//FUTURE CODE: have this go to the end game screen
		}
		else if (howManyPinkiesAlive <= 2){
			switchGameMode("lastTwo");
		}
		if (realPinkie == that){
			realPinkieDeath = hits;//marks the relative "time" of death of the real pinkie
		}
	}

	that.interval = 0;
	that.draw = function(){
		if (!that.markForDeletion){
			try {
				ctx.drawImage(that.image, 
				//0, that.height * that.actualFrame, that.width, that.height, 
				that.X, that.Y, that.width, that.height);
				ctx.fillStyle = 'black';
				ctx.font="20px Arial";
				ctx.fillText(that.getNumber(), that.X, that.Y + that.height);
				// if (realPinkie == that){
					// ctx.fillText("I'm the real pinkie!", that.X, that.Y + that.height - 20);
				// }//TEST CODE: used to help reach a desired endgame, or specific scenario in-game
			}
			catch (e) {
			};

			if (that.interval == 4 ) {
				if (that.actualFrame == that.frames) { 
					that.actualFrame = 0;
				}
				else {
					that.actualFrame++;
				}
				that.interval = 0;
			}
			that.interval++;	
		}
	}
		
	pinkieArray.push(that);
	howManyPinkies += 1;
}

var howManyPinkies = 0;
var howManyPinkiesAlive = maxPinkies;
var pinkieArray = [];
for (var i = 0; i < maxPinkies; i++){
	var pinkie = new Pinkie();//this makes new pinkies and handles adding it the array
	pinkie.index = i;
}

var hitPinkies = 0;//the pinkies that have been sent back
var hitPinkieAllowedGap = 5;//the allowed gap between hitPinkies and hitPinkieCheckPoint before going into chooseSave gameMode
var hitPinkieCheckPoint = -hitPinkieAllowedGap;//the last amount of hits that resulted in a choice, the initial value sends it immediately into chooseSave

var layoutPinkies = function(){
	var maxColumns = 5;//the max amount of columns
	var cx = 0,
	cy = 0;//the counter variables for rows and columns
	var padding = 10;//pading between rows and columns
	var rowHeight = pinkieArray[0].height + padding,
	columnWidth = pinkieArray[0].width + padding;//the dimensions of each individual row/column
	var offsetX = (width - (maxColumns * columnWidth - padding)) / 2;
	var offsetY = padding;
	for (var i = 0; i < howManyPinkies; i++){
		if (pinkieArray[i] != savedPinkie){// || howManyPinkiesAlive == 2)//don't want to reposition the saved pinkie
			pinkieArray[i].setPosition(cx * columnWidth + offsetX, cy * rowHeight + offsetY);
		}
		else {//if (pinkieArray[i].X != 10){
			pinkieArray[i].X = 10;
			pinkieArray[i].Y = height - pinkieArray[i].height - 10;
			// ctx.fillText((height), 0, 60);
		}
		cx++;
		if (cx == maxColumns){
			cx = 0;
			cy++;
		}
	}
}



//
//Laser
//
//this class is for visual purposes only, possibly audio as well?
function Laser(){
	var that = this;
	that.X = 0;
	that.Y = 0;
	that.destX = 0;
	that.destY = 0;

	// that.image = new Image();
	// that.image.src = "fire.png";
	// that.width = 18;
	// that.height = 8;
	// that.frames = 0;
	// that.actualFrame = 0;

	//set where the laser comes from
	that.setStart = function(x, y){
		that.X = x;
		that.Y = y;
	}
	//set where the laser goes to (the target)
	that.setEnd = function(x, y){
		that.destX = x;
		that.destY = y;
	}

	that.draw = function(){
			try {
				ctx.strokeStyle = "#E1004D";
				ctx.lineWidth = 10;
				ctx.moveTo(that.X, that.Y);
				ctx.lineTo(that.destX, that.destY);
				ctx.stroke();
				ctx.strokeStyle = "#F792FD";//E1004D
				ctx.lineWidth = 7;
				ctx.moveTo(that.X, that.Y);
				ctx.lineTo(that.destX, that.destY);
				ctx.stroke();
				//ctx.drawImage(that.image, 0, that.height * that.actualFrame, that.width, that.height, that.X, that.Y, that.width, that.height);
			}
			catch (e) {
			};	
	}

}
var laser = new Laser();

//Brad: begin code for firing sound, taken from http://www.javascriptkit.com/script/script2/soundlink.shtml
// var html5_audiotypes={
// "wav": "audio/wav"
// }

// function createsoundbite(sound){
// var html5audio=document.createElement('audio')
// if (html5audio.canPlayType){ //check support for HTML5 audio
// for (var i=0; i<arguments.length; i++){
// var sourceel=document.createElement('source')
// sourceel.setAttribute('src', arguments[i])
// if (arguments[i].match(/\.(\w+)$/i))
// sourceel.setAttribute('type', html5_audiotypes[RegExp.$1])
// html5audio.appendChild(sourceel)
// }
// html5audio.load()
// html5audio.playclip=function(){
// html5audio.pause()
// html5audio.currentTime=0
// html5audio.play()
// }
// return html5audio
// }
// else{
// return {playclip:function(){throw new Error("Your browser doesn't support HTML5 audio. Try using Google Chrome!")}}
// }
// }
// var railgunsound=createsoundbite("railgun_sound.wav");
//Brad: end code for railgun sound

//This class is also visual only, possibly also audio?
var crossHair = new (function(){
	var that = this;
	that.image = new Image();
	that.image.src = "crosshair.png";
	that.X = 0;
	that.Y = 0;
	that.width = 100;//the dimensions of the cross hair image
	that.height = 100;
	
	that.setPosition = function(x, y){
		that.X = x - that.width / 2;
		that.Y = y - that.height / 2;
		//alert("crossHair sp");
	}
	
	that.setImage = function(gameMode){
		switch(gameMode){
			case "play": that.image.src = "crosshair.png"; break;
			case "chooseSave": that.image.src = "hand.png"; break;
		}
	}
	
	that.draw = function(){
		try {
			ctx.drawImage(that.image, 0, 0, that.width, that.height, that.X, that.Y, that.width, that.height);
		}
		catch (e) {
		};	
	}
})();

//
// Player
//
var player = new (function(){
	var that = this;
	that.image = new Image();

	//that.image.src = "block.png"
	 that.image.src = "twilight.png"
	that.width = 100;
	that.height = 100;
	that.frames = 0;
	that.actualFrame = 0;
	that.X = (width - that.width)/2;//center x
	that.Y = height - that.height;//bottom y
	that.gunX = 425 - that.X;//that.width / 2;//FUTURE CODE: figure out where exactly these values are
	that.gunY = 0;//the y coordinate where the railgun shoots at in relation to top of the player sprite
	laser.setStart(that.X + that.gunX, that.Y + that.gunY);

	that.setPosition = function(x, y){
		that.X = x;
		that.Y = y;
		// if (that.Y < 0){
			// that.Y = 0;
		// }
		// if (that.Y + that.height > height){
			// that.Y = height - that.height;
		// }
	}

	that.fire = function(){
		for (var i = 0; i < howManyPinkies; i++){
			if (pinkieArray[i].checkClick(mouseX, mouseY) == true){
				i = howManyPinkies;//TEST CODE: this will make the for loop stop ifthe following "break" doesn't
				break;
			}
		}
	}

	that.interval = 0;
	that.draw = function(){
		try {
			ctx.drawImage(that.image, 
			//0, that.height * that.actualFrame, that.width, that.height, 
			that.X, that.Y, that.width, that.height);
		}
		catch (e) {
		};

		if (that.interval == 4 ) {
			if (that.actualFrame == that.frames) {
				that.actualFrame = 0;
			}
			else {
				that.actualFrame++;
			}
			that.interval = 0;
		}
		that.interval++;	
	}
})();

var yPos = 185;
//player.setPosition(15, yPos);



document.addEventListener('keydown', function(event) {
    if(event.keyCode == 40) {
		//Movin' on up...
		yPos = yPos + 5;
        player.setPosition(15, yPos);
    }
    else if(event.keyCode == 38) {
		//Goin' down...
		yPos = yPos - 5;
        player.setPosition(15, yPos);
    }
});

c.addEventListener('mousemove', function(e){
		// player.setPosition(15, e.pageY);
		{//copied section
		//===the following section copied from http://simonsarris.com/blog/510-making-html5-canvas-useful ===
		 //var element = c, offsetX = 0, offsetY = 0, mx, my;
		  // Compute the total offset
		  // if (element.offsetParent !== undefined) {
			// do {
			  // offsetX += element.offsetLeft;
			  // offsetY += element.offsetTop;
			// } while ((element = element.offsetParent));
		  // } 
		  // Add padding and border style widths to offset
		  // Also add the <html> offsets in case there's a position:fixed bar
		  // offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
		  // offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;		 
		  // mx = e.pageX - offsetX;
		  // my = e.pageY - offsetY;
		  //===END COPIED SECTION===
		  }
		mouseX = e.pageX;
		mouseY = e.pageY;
		laser.setEnd(mouseX, mouseY);
});

//making the payer shoot
var playerFiring = false;//this says whether or not the player is firing
var playerFired = false;//if the player has taken a shot already, is meant to keep one click from taking out multiple pinkies
document.addEventListener('mousedown', function(e){
		playerFiring = true;
		if (gameMode == "play"){
			hitsAttempted += 1;
		}
		// player.fire();
		// railgunsound.playclip(); //Brad: code to play railgun sound
});

document.addEventListener('mouseup', function(e){
		playerFiring = false;
		// player.fire();
		// railgunsound.playclip(); //Brad: code to play railgun sound
});

//sets all the necessary variables to their initial values
function setUp(){
	//Pinkie
	howManyPinkiesAlive = maxPinkies;
	savedPinkie = 0;
	//pinkieArray = 0;
	//pinkieArray.clear();
	for (var i = 0; i < maxPinkies; i++){
		var pinkie = pinkieArray[i];//new Pinkie();//this makes new pinkies and handles adding it to the array
		pinkie.markForDeletion = false;
		pinkie.index = i;
	}
	var realPinkieIndex = Math.floor(Math.random() * ( (maxPinkies - 1) - 0 + 1) + 0);
	realPinkie = pinkieArray[realPinkieIndex];
	realPinkieDeath = 0;
	//Hit Pinkies
	hitPinkies = 0;
	hitPinkieAllowedGap = 5;//the allowed gap between hitPinkies and hitPinkieCheckPoint before going into chooseSave gameMode
	hitPinkieCheckPoint = -hitPinkieAllowedGap;
	numberText = 0;
	//Hits
	hits = 0;
	hitsAttempted = 0;
	//Player
	playerFiring = false;
	playerFired = false;
}

var GameLoop = function(){
	// var play = true;
	// if (gameMode == "results")play = false;
	clear();
	switch(gameMode){
		case "open": open(); break;
		case "info": info(); break;
		case "chooseSave": //FUTURE CODE: give "chooseSave" it's own metho
		case "play": play(); break;
		case "transToSave": transToSave(); break;
		case "lastTwo": lastTwo(); break;
		case "results": results(); break;
		case "credits": credits(); break;
	}
	modeTime += 1;
	gLoop = setTimeout(GameLoop, 1000 / 50);
	ctx.fillText("("+mouseX+", "+mouseY+")",width-100,20);
}

	var pinkies = new Image();
	pinkies.src = "pinkies.png";
	var psScrollY = 0;//used for scrolling the background
	var ponp = new Image();
	ponp.src = "ponp.png";//w:398 //Math.random(width - 100 + 100 + 1) + 100, Math.random(height - 100 + 100 + 1) + 100
	var openx = Math.random(width - 100 + 100 + 1) + 100;
	var openy = Math.random(height - 100 + 100 + 1) + 100;
	var openx2 = Math.random(width - 100 + 100 + 1) + 100;
	var openy2 = Math.random(height - 100 + 100 + 1) + 100;
function open(){//opening screen
	ctx.drawImage(pinkies, 0,psScrollY,width,height);
	ctx.drawImage(pinkies, 0,psScrollY-height,width,height);
	ctx.drawImage(pinkies, 0,psScrollY+height,width,height);
	psScrollY += 1;
	if (psScrollY > height)psScrollY = 0;
	ctx.drawImage(ponp, (width - ponp.width)/2, 10);
	// if (distracted < 0){
		// openx = Math.random(width - 100 + 100 + 1) + 100;
		// openy = Math.random(height - 100 + 100 + 1) + 100;
		// openx2 = Math.random(width - 100 + 100 + 1) + 300;
		// openy2 = Math.random(height - 100 + 100 + 1) + 100;
		// distracted = 1;
	// }
	var btnPlay = new Button("Play", 100, 100, "play");
	var btnCredits = new Button("credits", width/2, height/2 + 50, "credits");
	var btnInfo = new Button("howToPlay", 200, 200, "info");
	
	if (btnPlay.checkClick(mouseX, mouseY, playerFiring)){
		setUp();
	}
	else if (btnCredits.checkClick(mouseX, mouseY, playerFiring)){
	}
	else if (btnInfo.checkClick(mouseX, mouseY, playerFiring)){
	}
	
	btnPlay.draw();
	btnCredits.draw();
	btnInfo.draw();
	ctx.fillText("#MLGDMarathon May 2013", 10, height - 10);
}

var infoImage = new Image();
infoImage.src = "instructions.png";
function info(){
	ctx.drawImage(infoImage, 0,0, width, height);
	var btnOpen = new Button("main_menu", width/2 - 50, height - 50 - 10, "open");
	if (btnOpen.checkClick(mouseX, mouseY, playerFiring)){
	}
	btnOpen.draw();
}

var distracted = -1;
function play(){
		if (hitPinkies - hitPinkieCheckPoint >= hitPinkieAllowedGap){// || howManyPinkiesAlive <= 2){
			switchGameMode("transToSave");
			hitPinkieCheckPoint = hitPinkies;
			//alert("going into chooseSAVE");//TEST CODE
		}
		if (gameMode == "chooseSave" || howManyPinkiesAlive == 2){
			layoutPinkies();
			if (distracted < 0){//if distract button has not been clicked yet
				var btnDistract = new Button("distract", 10, 200, 0);
				btnDistract.draw();
				if (btnDistract.checkClick(mouseX, mouseY, playerFiring)){
					playerFired = true;//in chooseSave, you can only distract once for 5 seconds
					distracted = 50;
					for (var i = 0; i < howManyPinkies; i++){
						if (!pinkieArray[i].markForDeletion){
								pinkieArray[i].setDistracted();
						}
					}
					// distracted = true;
				}
			}
			else if (distracted > 0){//else if Pinkies are still distracted
				for (var i = 0; i < howManyPinkies; i++){
						if (!pinkieArray[i].markForDeletion){
								pinkieArray[i].distract();
						}
				}
				distracted -= 1;
			}
			//else if not distracted
		}
		
		if (howManyPinkiesAlive == 2)savedPinkie = 0;
		
		if (playerFiring){
			if (!playerFired){
				player.fire();
				playerFired = true;
			}
			if (gameMode=="play")laser.draw();
		}
		else {
			playerFired = false;
		}	
		
		
		for (var i = 0; i < howManyPinkies; i++){
			if (howManyPinkiesAlive > 2)pinkieArray[i].move();//TEMPORARY OMISSION
			pinkieArray[i].draw();			
			 // if (pinkieArray[i].markForDeletion){
				// pinkieArray.splice(i,1);
				// howManyPinkies -= 1;
			 // }
		}
		
		player.draw();
		
		crossHair.setPosition(mouseX, mouseY);
		crossHair.draw();
		
		//ctx.fillText(howManyPinkies, 0, 20);//TEST CODE
		ctx.fillText("Hits: "+hits, 0, 20);
		ctx.fillText("Clicks: "+hitsAttempted, 0, 40);
		
		if (savedPinkie){
			var shieldImg = new Image();
			shieldImg.src = "shield.png";
			ctx.drawImage(shieldImg, 0, height-shieldImg.height);
		}
}

var transToSaveImage = new Image();
transToSaveImage.src = "order!_original.png";
var sitDownImg = new Image();
sitDownImg.src = "sitDown.png";
function transToSave(){
	ctx.drawImage(transToSaveImage, 0,0, width, height);
	if (modeTime >= 50){
		switchGameMode("chooseSave");
	}
	var rx = Math.random()*(5)-2;
	ctx.drawImage(sitDownImg, 10+rx, 10+rx, 300, 200);
}

var lastTwoImage = new Image();
lastTwoImage.src = "lastTwo.png";
var lastTwoTextImg = new Image();
lastTwoTextImg.src = "lastTwoText.png";
function lastTwo(){
	ctx.drawImage(lastTwoImage, 0,0, width, height);
	if (modeTime >= 100){
		switchGameMode("play");
	}
	var rx = Math.random()*(5)-2;
	ctx.drawImage(lastTwoTextImg, 270+rx, 50+rx, 300, 200);
}

//gameOver function to be fleshed out later
var numberText = 0;
function results(){
	// var go = new Image();
	// go.src = "gameoverman_gameover.png"
	// ctx.drawImage(go,0,0);
	//clear();//already called in GameLoop()
	var cx = 200,
		cy = 200,
		cw = 333,
		ch = 100;
	
	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(cx-10,cy-10,cw+20,ch+20);
	ctx.fillStyle = "#EE4F91";
	ctx.fillRect(cx-1,cy,cw+2,ch+2);
	
	ctx.fillStyle = "#F7B8CB";
	var percentage = Math.floor((hits * 80) / hitsAttempted);
	ctx.fillText("Hits: "+hits, cx, cy+20);
	ctx.fillText("Clicks: "+hitsAttempted, cx, cy+40);
	ctx.fillText("Accuracy: "+percentage+"%", cx, cy+60);
	var guessingSkills = 0;
	if (realPinkieDeath){
		//ctx.fillText("You killed Pinkie on the ?01 hit",0,80);
		if (!numberText){
			// var numberText = "th";
			switch(realPinkieDeath){
				case 21:
				case 1: numberText = "st"; break;
				case 22:
				case 2: numberText = "nd"; break;
				case 23:
				case 3: numberText = "rd"; break;
				default: numberText = "th";
			}
		}
		ctx.fillText("You killed Pinkie (#"+realPinkie.getNumber()+") on the "+realPinkieDeath+numberText+" hit",cx,cy+80);
		guessingSkills = (realPinkieDeath * 100)/maxPinkies;
		//ctx.fillText("You killed Pinkie on the ?02 hit",0,80);
	}
	else{
		ctx.fillText("You saved Pinkie! (#"+realPinkie.getNumber()+")",cx,cy+80);
		ctx.fillText("#PinkieSecretService",cx,cy+130);
		guessingSkills = 100;
	}
	ctx.fillText("Guessing Skills: "+guessingSkills+"%",cx,cy+100);
	
	var mainMenu = new Button("main_menu", 10, height/2, "open");//width/2
	var btnCredits = new Button("credits", 10, height/2 + 50, "credits");//,width/2
	if (mainMenu.checkClick(mouseX, mouseY, playerFiring)){
		//switchGame
	}
	else if (btnCredits.checkClick(mouseX, mouseY, playerFiring)){
	}
	mainMenu.draw();
	btnCredits.draw();
}

var creditsImg = new Image();
creditsImg.src = "creditPage.png";
var logoImg = new Image();
logoImg.src = "logo.png";
function credits(){
	// ctx.fillText("\"PINKIE OR NOT PINKIE\"\nshieldgenerator7\n\nWith vectors from\n\n"
	// +"Based on\nMy Little Pony: Friendship is Magic\nSeason 3 Episode 3: \"Too Many Pinkies\"",100,100);
	ctx.drawImage(creditsImg, 10, 10, width - 20, height - 70);
	ctx.drawImage(logoImg, 442, 37, 317, 160);
	var mainMenu = new Button("main_menu", 10, height-50-9, "open");
	if (mainMenu.checkClick(mouseX, mouseY, playerFiring)){
		//switchGame
	}
	mainMenu.draw();
	ctx.font = "30px";
	ctx.fillStyle = "#EE4F91";
	ctx.fillText("Praise the Lord!  /)",width/2 - 50, 19);
}

//setUp();

GameLoop();