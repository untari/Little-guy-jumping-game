/*
Coursework 2.2 Game Project Submissions

	 I learnt how to add a sound to my jump function, so whenever my game character jump it will have sound.
	 And I learnt how to create an object(platform) using factory pattern  
	 I also learnt how to create an object using constructor. However I find it difficult in the section
	 where I use "this" in the function as it always suggested to change it into class function or use "constructor" inside the function instead.

 */

var gameChar_x;
var gameChar_y;
var gameChar_world_x;
var floorPos_y;
var scrollPos;


var isLeft;
var isRight;
var isFalling;
var isPlummeting;
var isDead;

var clouds;
var collectables;
var canyons;
var mountains;
var trees_x;

var enemies;
var flagpole;
var game_score;
var jumpSound;
var lives;
var liveHearts;
var platforms;




function preload()
{
    soundFormats('mp3','wav');
    
    //load jumping sounds
    jumpSound = loadSound('assets/jump.wav');
    jumpSound.setVolume(0.2);
}


function setup()
{
	createCanvas(1024, 576);
	floorPos_y = height * 3/4;

	lives = 3;

	startGame();
}

function startGame()
{
	gameChar_x = width/2;
	gameChar_y = floorPos_y;

	// Variable to control the background scrolling.
	scrollPos = 0;

	// Variable to store the real position of the gameChar in the game
	// world. Needed for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

	// Boolean variables to control the movement of the game character.
	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;

	// Initialise arrays of scenery objects.
	clouds = [
		{pos_x: 100, pos_y: 200},
		{pos_x: 500, pos_y: 100},
		{pos_x: 1000, pos_y: 100}
	];

	mountains = [
		{pos_x: 300, height: 400},
		{pos_x: 500, height: 200},
		{pos_x: 800, height: 200},
		{pos_x: 1000, height: 300},
		{pos_x: 1300, height: 400},
		{pos_x: 1500, height: 200},
		{pos_x: 1800, height: 200},
		{pos_x: 2000, height: 300}
	];

	trees_x = [250, 350, 850, 1200, -500];

	collectables = [
		{x_pos: 100, y_pos: floorPos_y, size: 50, isFound: false},
		{x_pos: 1000, y_pos: floorPos_y, size: 30, isFound: false},
		{x_pos: 1800, y_pos: floorPos_y, size: 40, isFound: false}
	];

	canyons = [
		{x_pos: 190, width: 90},
		{x_pos: 700, width: 100},
		{x_pos: 1200, width: 120},
	];

	platforms = [];

	platforms.push(createPlatform(150, floorPos_y - 100, 155));
	platforms.push(createPlatform(600, floorPos_y - 100, 130));

	liveHearts  = [950, 900, 850];

	game_score = 0;

	flagpole = {isReached: false, x_pos: 1500};

	isDead = false;

	enemies = [];
	
	enemies.push(new enemy(70, floorPos_y - 10, 110));
}

function draw()
{
	background(100, 155, 255); // fill the sky blue

	noStroke();
	fill(0,155,0);
	rect(0, floorPos_y, width, height/4); // draw some green ground

	push();
	translate(scrollPos, 0);
	// Draw clouds.
	drawClouds();

	// Draw mountains.
	drawMountains();

	// Draw trees.
	drawTrees();
	
	//draw platforms
	for(var i = 0; i < platforms.length; i++)
	{
		platforms[i].draw();
	}

	// Draw collectable items.
	for(var i = 0; i < collectables.length; i++)
	{
		if(!collectables[i].isFound)
		{
			drawCollectable(collectables[i]);
			checkCollectable(collectables[i]);
		}
	}

	// Draw canyons.
	for(var i =0; i < canyons.length; i++)
	{
		drawCanyon(canyons[i]);
		checkCanyon(canyons[i]);
	}

	//draw flagpole
	if(!checkFlagpole.isReached)
	{
		checkFlagpole(flagpole);
	}
	renderFlagpole(flagpole);
	
	//draw enemies
	for(var i =0; i < enemies.length; i++)
	{
		
		enemies[i].draw();

		//check if enemis has contact with the game variable
		var isContact = enemies[i].checkContact(gameChar_world_x, gameChar_y);
		{
			if(isContact)
			{
				if(lives > 0)
				{
					startGame();
					break;
				}
			}
		}
	}
	
	pop();

	// Draw game character
	drawGameChar();
	
	//text for score
	fill(255);
	noStroke();
	text("score: " + game_score, 20, 50);

	//draw lives heart
	for(var i = 0; i < lives; i++)
	{
		drawLiveHearts(liveHearts[i]);
	}
	
	//game over or level complete
	fill(255);
	noStroke();
	textSize(55);
	if(lives < 1)
	{
		text("Game Over. Press to continue", 100, 300);
		return;
	}
	if(flagpole.isReached == true)
	{
		text("Level complete. Press to continue", 75, 300);
		return;
	}
	
	// Logic to make the game character move or the background scroll.
	if(isLeft)
	{
		if(gameChar_x > width * 0.2)
		{
			gameChar_x -= 5;
		}
		else
		{
			scrollPos += 5;
		}
	}

	if(isRight)
	{
		if(gameChar_x < width * 0.8)
		{
			gameChar_x  += 5;
		}
		else
		{
			scrollPos -= 5; // negative for moving against the background
		}
	}

	// Logic to make the game character rise and fall.
	if(gameChar_y < floorPos_y)
	{
		var isContact = false;
		for(var i = 0; i < platforms.length; i++)
		{
			if(platforms[i].checkContact(gameChar_world_x, gameChar_y) == true)
			{
				isContact = true;
				break;
			}
		}
		if(isContact == false)
		{
			gameChar_y += 2;
			isFalling = true;
		}
	}
	else{
		isFalling = false;
	}
	if(isPlummeting)
	{
		gameChar_y += 5;
	}

	if(flagpole.isReached == false)
	{
		checkFlagpole();
	}

	//logic to check if game char is died
	if(isDead == false)
	{
		checkPlayerDie();
	}

	//Update real position of gameChar for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;
}

// Key control functions

function keyPressed(){

	// console.log("press" + keyCode);
	// console.log("press" + key);
	if(key == "A" || keyCode == 37)
	{
		isLeft = true;
	}
	if(key == "D" || keyCode == 39)
	{
		isRight = true;
	}
	if(key == "" || key == "W")
	{
		if(!isFalling)
		{
			gameChar_y -= 100;
			jumpSound.play();
		}
	}
}

function keyReleased()
{

	// console.log("release" + keyCode);
	// console.log("release" + key);
	if(key == "A" || keyCode == 37)
	{
		isLeft = false;
	}
	if(key == "D" || keyCode == 39)
	{
		isRight = false;
	}

}

// Function to draw the game character.

function drawGameChar()
{
	
	// draw game character
	if(isLeft && isFalling)
	{
		// add your jumping-left code

		fill(255, 255, 0);
		ellipse(gameChar_x, gameChar_y - 55, 35);

		fill(0);
		ellipse(gameChar_x -8, gameChar_y -57, 5, 5);
		ellipse(gameChar_x +9, gameChar_y -57, 5, 5);

		fill(0, 128, 0);
		rect(gameChar_x - 13, gameChar_y - 35, 25, 30);

		fill(0);
		rect(gameChar_x - 30, gameChar_y - 35, 20, 10);
		rect(gameChar_x + 10, gameChar_y - 35, 20, 10);

		fill(0);
		rect(gameChar_x - 20, gameChar_y - 10, 15, 10);
		rect(gameChar_x + 5, gameChar_y - 7, 10, 10);

	}
	else if(isRight && isFalling)
	{
		// add your jumping-right code

		fill(255, 255, 0);
		ellipse(gameChar_x, gameChar_y - 55, 35);

		fill(0);
		ellipse(gameChar_x -8, gameChar_y -57, 5, 5);
		ellipse(gameChar_x +9, gameChar_y -57, 5, 5);


		fill(0, 128, 0);
		rect(gameChar_x - 13, gameChar_y - 35, 25, 30);

		fill(0);
		rect(gameChar_x - 30, gameChar_y - 35, 20, 10);
		rect(gameChar_x + 10, gameChar_y - 35, 20, 10);

		fill(0);
		rect(gameChar_x - 15, gameChar_y - 7, 10, 10);
		rect(gameChar_x + 5, gameChar_y - 10, 15, 10);

	}
	else if(isLeft)
	{
		// add your walking left code
		fill(255, 255, 0);
		ellipse(gameChar_x, gameChar_y - 55, 35);

		fill(0);
		ellipse(gameChar_x -8, gameChar_y -57, 5, 5);
		ellipse(gameChar_x +9, gameChar_y -57, 5, 5);

		fill(0, 128, 0);
		rect(gameChar_x - 13, gameChar_y - 35, 25, 30);

		fill(0);
		rect(gameChar_x - 30, gameChar_y - 35, 20, 10);
		rect(gameChar_x + 10, gameChar_y - 35, 20, 10);

		fill(0);
		rect(gameChar_x - 22, gameChar_y - 7, 14, 10);
		rect(gameChar_x - 2, gameChar_y - 7, 15, 10);
		// gameChar_x -= 5;

	}
	else if(isRight)
	{
		// add your walking right code
		fill(255, 255, 0);
		ellipse(gameChar_x, gameChar_y - 55, 35);

		fill(0);
		ellipse(gameChar_x -8, gameChar_y -57, 5, 5);
		ellipse(gameChar_x +9, gameChar_y -57, 5, 5);

		fill(0, 128, 0);
		rect(gameChar_x - 13, gameChar_y - 35, 25, 30);

		fill(0);
		rect(gameChar_x - 30, gameChar_y - 35, 20, 10);
		rect(gameChar_x + 10, gameChar_y - 35, 20, 10);

		fill(0);
		rect(gameChar_x - 13, gameChar_y - 8, 14, 10);
		rect(gameChar_x + 5, gameChar_y - 8, 15, 10);

	}
	else if(isFalling || isPlummeting)
	{
		// add your jumping facing forwards code
		fill(255, 255, 0);
		ellipse(gameChar_x, gameChar_y - 55, 35);

		fill(0);
		ellipse(gameChar_x - 8, gameChar_y - 57, 5, 5);
		ellipse(gameChar_x + 9, gameChar_y - 57, 5, 5);


		fill(0, 128, 0);
		rect(gameChar_x - 13, gameChar_y - 35, 25, 30);

		fill(0);
		rect(gameChar_x - 30, gameChar_y - 35, 20, 10);
		rect(gameChar_x + 10, gameChar_y - 35, 20, 10);

		fill(0);
		rect(gameChar_x - 19, gameChar_y - 10, 14, 10);
		rect(gameChar_x + 5, gameChar_y - 6, 10, 10);


	}
	else
	{
		// add your standing front facing code
		fill(255, 255, 0);
		ellipse(gameChar_x, gameChar_y - 55, 35);

		fill(0);
		ellipse(gameChar_x - 8, gameChar_y - 57, 5, 5);
		ellipse(gameChar_x + 9, gameChar_y - 57, 5, 5);

		fill(0, 128, 0);
		rect(gameChar_x - 13, gameChar_y - 35, 25, 30);

		fill(0);
		rect(gameChar_x - 30, gameChar_y - 35, 20, 10);
		rect(gameChar_x + 10, gameChar_y - 35, 20, 10);

		fill(0);
		rect(gameChar_x - 15, gameChar_y - 5, 10, 10);
		rect(gameChar_x + 5, gameChar_y - 5, 10, 10);

	}
}

// Function to draw cloud objects.
function drawClouds()
{
	for(var i = 0; i < clouds.length; i++)
	{
		fill(255);
		{
			ellipse(clouds[i].pos_x, clouds[i].pos_y, 35, 45);
			ellipse(clouds[i].pos_x + 55, clouds[i].pos_y, 45, 55);
			ellipse(clouds[i].pos_x + 25, clouds[i].pos_y, 45, 55);
		}
	}
}

// Function to draw mountains objects.
function drawMountains()
{
	for(var i = 0; i < mountains.length; i++)
	{
		fill(100);
		triangle(mountains[i].pos_x - mountains[i].height/2, floorPos_y,
			mountains[i].pos_x, floorPos_y - mountains[i].height, 
			mountains[i].pos_x + mountains[i].height/2, floorPos_y);
	}
}

// Function to draw trees objects.
function drawTrees()
{
	for(let i = 0; i < trees_x.length; i++)
	{
		fill(100, 50, 0);
		rect(75 + trees_x[i], -200/2 + floorPos_y, 50, 200/2);
		fill(0, 100, 0);
		triangle(
			trees_x[i] + 25, -200/2 + floorPos_y, 
			trees_x[i] + 100, -200 + floorPos_y,
			trees_x[i] + 175, -200/2 + floorPos_y
		);
		triangle(
			trees_x[i], -200/4 + floorPos_y, 
			trees_x[i] + 100, -200 * 3/4 + floorPos_y,
			trees_x[i] + 200, -200/4 + floorPos_y
		);
	}
}

// Function to draw collectable objects.
function drawCollectable(t_collectable)
{
	noFill();
	strokeWeight(6);
	stroke(255, 248,);
	ellipse(t_collectable.x_pos, t_collectable.y_pos -20, t_collectable.size);
	fill(199, 21, 133);
	stroke(255);
	strokeWeight(1);
	quad(
		t_collectable.x_pos -5, t_collectable.y_pos - t_collectable.size,
		t_collectable.x_pos -10, t_collectable.y_pos - (t_collectable.size + 15),
		t_collectable.x_pos + 10, t_collectable.y_pos - (t_collectable.size + 15),
		t_collectable.x_pos + 5, t_collectable.y_pos - t_collectable.size
	);
}

// Function to check character has collected an item.

function checkCollectable(t_collectable)
{
	if(dist(gameChar_world_x, gameChar_y, t_collectable.x_pos, t_collectable.y_pos)
	< t_collectable.size)
	{
		t_collectable.isFound = true;
		game_score += 1; 
	}
}

//livesHearts function

function drawLiveHearts(heart)
{
	push();

	fill(255, 0, 0);

	beginShape();
	vertex(heart, 45);
	vertex(heart + 10, 35);
	vertex(heart + 20, 45);
	vertex(heart, 65);
	vertex(heart - 20, 45);
	vertex(heart - 10, 35);
	vertex(heart, 45);
	endShape();

	pop();
}

// Function to draw canyon objects.

function drawCanyon(t_canyon)
{
	fill(0, 255, 255);
	rect(t_canyon.x_pos, floorPos_y, t_canyon.width, height - floorPos_y);
}

// Function to check character is over a canyon.

function checkCanyon(t_canyon)
{
	if(gameChar_world_x > t_canyon.x_pos && gameChar_world_x < t_canyon.x_pos 
	+ t_canyon.width && gameChar_y >= floorPos_y)
	{
		isPlummeting = true;
	}
}

//flagpole
function renderFlagpole(t_flagpole)
{
	push();
	strokeWeight(5);
	stroke(180);
	line(t_flagpole.x_pos, floorPos_y, flagpole.x_pos, floorPos_y - 250);
	fill(255, 0, 255);
	noStroke();

	if(flagpole.isReached)
	{
		rect(flagpole.x_pos, floorPos_y - 250, 50, 50);
	}
	else{
		rect(flagpole.x_pos, floorPos_y - 50, 50, 50);
	}
	pop();

}

function checkFlagpole()
{
	var d = abs(gameChar_world_x - flagpole.x_pos);

	if(d < 15)
	{
		flagpole.isReached = true;
	}

	console.log(d);
}
 
//function to check if game character lose lives
function checkPlayerDie()
{
	if(gameChar_y > height)
	{
		isDead = true;
		lives -= 1;
		if(lives > 0 )
		{
			startGame();
		}
	}
}

//function to create platform 
function createPlatform(x, y, length)
{
	var p = {
		x: x,
		y: y,
		length: length,
		draw: function(){
			fill(189, 183, 107);
			rect(this.x, this.y, this.length, 20);
		},
		checkContact: function(gc_x, gc_y)
		{
			if(gc_x > this.x && gc_x < this.x + this.length)
			{
				var d = this.y - gc_y;
				if(d >= 0 && d < 5)
				{
					return true;
				}
			}
			return false;
		} 
	}
	return p;
}

//function enemies

function enemy(x, y, range)
{	

	this.x = x;
	this.y = y;
	this.range = range;
	this.currentX = x;
	this.inc = 0.5;


	this.update = function()
	{
		this.currentX += this.inc;

		if(this.currentX >=  this.x + this.range)
		{
			this.inc = -1;
		}
		else if( this.currentX < x)
		{
			this.inc = 1;
		}
	},
	this.draw = function()
	{
		this.update();
		fill(255, 0, 0);
		ellipse( this.currentX,  this.y, 20, 20);		
	}
	this.checkContact = function(gc_x, gc_y){
		var d = dist(gc_x, gc_y, this.currentX, this.y)
		if(d < 20)
		{
			return true;
		} 
		return false;
	}
}

