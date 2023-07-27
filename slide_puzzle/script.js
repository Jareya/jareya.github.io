window.onload = function init() {
	game();
}

function game() {
	window.Game = {};

	Game.board = {}
	Game.board.width = 4;
	Game.board.height = 4;

	Game.board.tiles = [];
	Game.board.tiles.borderWidth = 4; // in pixels
	Game.board.tiles.borderSeparation = false;

	Game.defaultImage = 'https://i.imgur.com/crjig5f.png';
	loadImage(Game.defaultImage);

	Game.canvas = document.getElementById('c');
	Game.cx = Game.canvas.getContext('2d', { alpha: false });

	Game.pts = 0;
	Game.fps = { count: 0, time: 0 };

	function main(ts) {
		Game.dt = ts - Game.pts;
		Game.pts = ts;
		updateFPS(Game.fps, Game.dt);
		updateCanvas();
		window.requestAnimationFrame(main);
	}

	main(0);
}

function loadImage(src) {
	Game.imgLoaded = false;
	Game.img = new Image();
	Game.img.onload = function () {
		Game.board.tiles.width = Math.ceil(Game.img.width / Game.board.width);
		Game.board.tiles.height = Math.ceil(Game.img.height / Game.board.height);
		Game.canvas.width = Game.board.tiles.width * Game.board.width;
		Game.canvas.height = Game.board.tiles.height * Game.board.height;
		if (Game.board.tiles.borderSeparation) {
			Game.canvas.width += Game.board.tiles.borderWidth * (Game.board.width - 1);
			Game.canvas.height += Game.board.tiles.borderWidth * (Game.board.height - 1);
		}

		Game.board.tiles.length = Game.board.width * Game.board.height;
		for (let i = 0; i < Game.board.tiles.length; i++) {
			Game.board.tiles[i] = {
				i: i,
				sx: i % Game.board.width * Game.board.tiles.width,
				sy: Math.floor(i / Game.board.height) * Game.board.tiles.height,
				dx: i % Game.board.width * Game.board.tiles.width,
				dy: Math.floor(i / Game.board.height) * Game.board.tiles.height
			};
		}
		shuffle(Game.board.tiles);

		Game.imgLoaded = true;
		console.log(Game);
	};
	Game.img.src = src || Game.defaultImage;
}

function shuffleImg() {
}

function updateCanvas() {
	if (Game.imgLoaded) {
		for (tile of Game.board.tiles) {
			Game.cx.drawImage(Game.img, tile.sx, tile.sy,
				Game.board.tiles.width, Game.board.tiles.height,
				tile.dx, tile.dy,
				Game.board.tiles.width, Game.board.tiles.height);
		}
	}
}

function updateFPS(fps, dt) {
	if (fps.time >= 500) {
		document.getElementById('fps').innerText =
			Math.round(fps.count / fps.time * 1000) + ' fps';
		fps.count = 0;
		fps.time = 0;
	}
	fps.count += 1;
	fps.time += dt;
}

function shuffle(ary) {
	var i = ary.length;
	var temp, rand;
	while (i > 0) {
		rand = Math.floor(Math.random() * i--);
		temp = ary[i];
		ary[i] = ary[rand];
		ary[rand] = temp;
	}
}
