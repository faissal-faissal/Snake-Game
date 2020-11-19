 window.onload = function()
 {
	 var ctx;
	 var delay = 100;	 
	 var snakee;
	 var canvasWidth = 900;
	 var canvasHeigth = 600;
	 var blockSize = 30;
	 var applee;
	 var widthInBlocks = canvasWidth/blockSize;
	 var heightInBlocks = canvasHeigth/blockSize;
	 var score;
	 var timeout;
	 
	 init();
	 
	 /* Fonction d'initialisation pour créer l'état de départ du jeu */
	 function init()
	 {
		var canvas = document.createElement('canvas');
		canvas.width = canvasWidth;
		canvas.height = canvasHeigth;
		canvas.style.border= "30px solid gray";
		canvas.style.margin = "50px auto";
		canvas.style.display = "block";
		canvas.style.backgroundColor = "#ddd"; 
		document.body.appendChild(canvas);
		ctx = canvas.getContext('2d');
		snakee = new Snake([[6,4], [5,4], [4, 4]], "right");
		applee = new Apple([10,10]);
		score = 0;
		refreshCanvas();
	 }
	 
	/* Fonction qui va orchestrer le fonctionnement du jeu */
	function refreshCanvas()
	{
		ctx.clearRect(0,0, canvasWidth, canvasHeigth);
		snakee.draw();
		snakee.advance();
		if(snakee.checkCollision())
		{
			gameOver();
		}
		else 
		{
			if(snakee.isEatingApple(applee))
			{
				score += 1;
				snakee.ateApple = true;
				do
				{
					applee.setNewPosition();
				}
				while(applee.isOnSnake(snakee));
			}
			ctx.clearRect(0,0, canvasWidth, canvasHeigth);
			drawScore();
			snakee.draw();
			applee.draw();
			timeout = setTimeout(refreshCanvas, delay);			
		}
	}
	
	function gameOver()
	{
		ctx.save();
		ctx.font = "bold 70px sans-serif";
		ctx.fillStyle = "#000";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.strokeStyle = "white";
		ctx.lineWidth = 5;
		var centreX = canvasWidth/2;
		var centreY = canvasHeigth/2;		
		ctx.strokeText("Game Over", centreX, centreY -180);
		ctx.fillText("Game Over", centreX, centreY -180);
		ctx.font = "bold 30px sans-serif";
		ctx.strokeText("Appuyer sur la touche Espace pour rejouer", centreX, centreY - 120);
		ctx.fillText("Appuyer sur la touche Espace pour rejouer", centreX, centreY - 120);
		ctx.restore();
	}
	
	function restart()
	{
		snakee = new Snake([[6,4], [5,4], [4, 4]], "right");
		applee = new Apple([10,10]);
		score = 0;
		clearTimeout(timeout);
		refreshCanvas();
	}
	
	function drawScore()
	{
		ctx.save();
		ctx.font = "bold 200px sans-serif";
		ctx.fillStyle = "gray";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		var centreX = canvasWidth/2;
		var centreY = canvasHeigth/2;
		ctx.fillText(score.toString(), centreX, centreY);		
		ctx.restore();
	}
	
	function drawBlock(ctx, position)
	{
		var x = position[0] * blockSize;
		var y = position[1] * blockSize;
		ctx.fillRect(x, y, blockSize, blockSize);
	}
	
	/* Fonction constructeur de serpent qui va le dessiner et le faire avancer */
	function Snake(body, direction)
	{
		this.body = body;
		this.direction = direction;
		this.ateApple = false;
		this.draw = function()
		{
			ctx.save();
			ctx.fillStyle = "#165816";
			for(var i = 0; i < this.body.length; i++)
			{
				drawBlock(ctx, this.body[i]);
			}
			ctx.restore();
		};
		
		/* Méthode pour faire avancer le serpent */
		this.advance = function()
		{
			var nextPosition = this.body[0].slice();
			if (this.direction === "right")
			{
				/*var nextPositionX = nextPosition[0] + 1;*/
				nextPosition[0] += 1;
			}
			else if (this.direction === "left")
			{
				nextPosition[0] -= 1;
			}	
			else if (this.direction === "down")
			{
				nextPosition[1] += 1;
			}	
			else if (this.direction === "up")
			{
				nextPosition[1] -= 1;
			}					
			this.body.unshift(nextPosition);
			if(!this.ateApple)					/* Si le serpent ne mange pas la paomme, je supprime le dernier élément de son copr lors du mouvement */
				this.body.pop();
			else
				this.ateApple = false;
		};
		
		/* Méthode pour déterminer les directions possibles */ 
		this.setDirection = function(newDirection)
		{
			var allowedDirections;
			switch(this.direction)
			{
				case "left":
				case "right":
					allowedDirections=["up","down"];
					break;
				case "up":
				case "down":
					allowedDirections=["left","right"];
					break;
				default:
					throw("Invalid Direction");
			}
			if(allowedDirections.indexOf(newDirection) > -1)
			{
				this.direction = newDirection;
			};
		};
		
		/* Méthode pour gérer le cas de collision avec le mur ou le
		serpent avec son propre corps */
		this.checkCollision = function()
		{
			var WallCollision = false;
			var snakeCollision = false;
			var head = this.body[0];			/* On récupère la position de la tête */
			var rest = this.body.slice(1);		/* On récupère la position du reste du corps */
			var snakeX = head[0];
			var snakeY = head[1];
			var minX = 0;
			var minY = 0;
			var maxX = widthInBlocks - 1;
			var maxY = heightInBlocks - 1;	
			var isNotBetweenHorizontalWalls = snakeX < minX || snakeX > maxX;
			var isNotBetweenVerticalWalls = snakeY < minY || snakeY > maxY;
			if(isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls)
			{
				WallCollision = true;
			}
			for(var i = 0; i < rest.length; i++)
			{
				/*var coordBody = rest[i];
				var coordXBody = coordBody[0];
				var coordYBody = coordBody[1];
				if(snakeX === coordXBody && snakeY === coordYBody)*/
				if(snakeX === rest[i][0] && snakeY === rest[i][1])				
				{
					snakeCollision = true;
					break;
				}
			}
			return WallCollision || snakeCollision;   /* si un des 2 est vrai alors retourne vrai, si les deux sont faux alors retourne faux */
		};
		this.isEatingApple = function(appleToEat)	/* Cette méthode renvoit True si le serpent mange la pomme et False sinon */
		{
			var head = this.body[0];
			if(head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1])
				return true;
			else
				return false;
		}
	}
	
	/* Création de la pomme */
	function Apple(position)
	{
		this.position = position;
		this.draw = function()
		{
			ctx.save();
			ctx.fillStyle = "red";
			ctx.beginPath();
			var radius = blockSize/2;
			var x = this.position[0]*blockSize + radius;
			var y = this.position[1]*blockSize + radius;
			ctx.arc(x, y, radius, 0, Math.PI*2, true);     /* Création d'un cercle */
			ctx.fill();									   /* Remplissage du cercle */
			ctx.restore();
		}
		this.setNewPosition = function()
		{
			var newX = Math.round(Math.random() * (widthInBlocks - 1));
			var newY = Math.round(Math.random() * (heightInBlocks - 1));
			this.position = [newX, newY];
		}
		this.isOnSnake = function(snakeToCheck)
		{
			var isOnSnake = false;
			for(var i = 0; i < snakeToCheck.body.length; i++)
			{ 
				if(this.position[0] === snakeToCheck.body[i][0] && this.position[1] === snakeToCheck.body[i][1])
				{
					isOnSnake = true;
				}
			}
			return isOnSnake;
		}
	}
	
	/* Fonctionnalité pour remonter dans mes variables js la touche 
	directionnelle choisie par l'utilisateur */ 
	document.onkeydown = function handleKeyDown(e)
	{
		var key = e.keyCode;
		var newDirection;
		switch(key)
		{
			case 37:
				newDirection = "left";
				break;
			case 38:
				newDirection = "up";
				break;
			case 39:
				newDirection = "right";
				break;
			case 40:
				newDirection = "down";
				break;
			case 32:
				restart();
				return;
			default:
				return;
		}
		snakee.setDirection(newDirection);
	};
	
 }