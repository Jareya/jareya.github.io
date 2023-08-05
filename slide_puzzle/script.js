window.onload = function init() {
	game();
}

function game() {
	window.Game = {};

	Game.states = {
		loading: 0,
		loaded: 1,
		shuffled: 2,
		inProgress: 3,
		end: 4
	}

	Game.state = Game.states.loading;

	Game.board = {}
	Game.board.width = 4;
	Game.board.height = 4;

	Game.board.tiles = [];
	Game.board.tiles.borderSize = 4; // in pixels
	Game.board.tiles.borderSeparation = true;

	Game.defaultImage = 'https://i.imgur.com/crjig5f.png';
	loadImage(Game.defaultImage);

	Game.canvas = document.getElementById('c');
	Game.cx = Game.canvas.getContext('2d', {
		alpha: false
	});

	Game.eventQueue = [];
	for (const ev of ['pointerdown']) {
		Game.canvas.addEventListener(ev, e => {
			Game.eventQueue.push(e);
		});
	}

	Game.pts = 0;
	Game.fps = {
		count: 0,
		time: 0
	};

	function main(ts) {
		Game.dt = ts - Game.pts;
		Game.pts = ts;
		// updateFPS(Game.fps, Game.dt);
		processEvents();
		updateCanvas();
		window.requestAnimationFrame(main);
	}

	main(0);
}

function loadImage(src) {
	Game.img = new Image();
	Game.img.onload = function() {
		Game.board.tiles.width = Math.floor(Game.img.width / Game.board.width);
		Game.board.tiles.height = Math.floor(Game.img.height / Game.board.height);
		Game.canvas.width = Game.board.tiles.width * Game.board.width;
		Game.canvas.height = Game.board.tiles.height * Game.board.height;
		if (Game.board.tiles.borderSeparation) {
			Game.canvas.width += Game.board.tiles.borderSize * (Game.board.width - 1);
			Game.canvas.height += Game.board.tiles.borderSize * (Game.board.height - 1);
		}

		Game.board.tiles.length = 0;

		for (let row = 0; row < Game.board.height; row++) {
			Game.board.tiles[row] = [row];
			for (let col = 0; col < Game.board.width; col++) {
				Game.board.tiles[row][col] = {
					id: [row, col],
					row: row,
					col: col,
					sx: col * Game.board.tiles.width,
					sy: row * Game.board.tiles.height,
					hidden: false
				};
			}
		}

		Game.state = Game.states.loaded;
	};
	Game.img.src = src || Game.defaultImage;
}

function processEvents() {
	while (Game.eventQueue.length > 0) {
		const e = Game.eventQueue.shift();
		switch (e.type) {
			case 'pointerdown':
				const x = e.pageX - e.target.offsetLeft;
				const y = e.pageY - e.target.offsetTop;
				const tile = tileAtCoords(Game.board.tiles, x, y);
				switch (Game.state) {
					case Game.states.loaded:
						shuffleImg();
						break;
					case Game.states.shuffled:
						if (tile) removeTile(tile);
						break;
					case Game.states.inProgress:
						if (tile) moveTile(tile);
						break;
				}
				break;
		}
	}
}

function shuffleImg() {
	let ary = Game.board.tiles.flat();
	shuffle(ary);
	for (let row = 0; row < Game.board.height; row++) {
		for (let col = 0; col < Game.board.width; col++) {
			Game.board.tiles[row][col] = ary.shift();
			Game.board.tiles[row][col].row = row;
			Game.board.tiles[row][col].col = col;
		}
	}

	Game.state = Game.states.shuffled;
}

function tileAtCoords(tiles, x, y) {
	let row = Math.floor(y / (tiles.height + tiles.borderSize));
	let col = Math.floor(x / (tiles.width + tiles.borderSize));
	if ((y - row * (tiles.height + tiles.borderSize)) > tiles.height) {
		return null;
	}
	if ((x - col * (tiles.width + tiles.borderSize)) > tiles.width) {
		return null;
	}
	return tiles[row][col];
}

function removeTile(tile) {
	tile.hidden = true;
	Game.board.tiles.hiddenTile = tile;
	Game.state = Game.states.inProgress;
}

function moveTile(tile) {
	let hidden = Game.board.tiles.hiddenTile;
	if (adjacentToHidden(tile, hidden)) {
		Game.board.tiles[hidden.row][hidden.col] = tile;
		Game.board.tiles[tile.row][tile.col] = hidden;
		let temp = [tile.row, tile.col];
		tile.row = hidden.row;
		tile.col = hidden.col;
		hidden.row = temp[0];
		hidden.col = temp[1];
	}
}

function adjacentToHidden(tile, hidden) {
	if (tile.row != hidden.row && tile.col != hidden.col) return false;
	return ((tile.row == hidden.row + 1 || tile.row == hidden.row - 1) !=
		(tile.col == hidden.col + 1 || tile.col == hidden.col - 1));
}

function updateCanvas() {
	if (Game.state >= Game.states.loaded) {
		for (let row = 0; row < Game.board.height; row++) {
			for (let col = 0; col < Game.board.width; col++) {
				let tile = Game.board.tiles[row][col];
				let dest_x = (Game.board.tiles.width + (Game.board.tiles.borderSeparation ?
					Game.board.tiles.borderSize : 0)) * col;
				let dest_y = (Game.board.tiles.height + (Game.board.tiles.borderSeparation ?
					Game.board.tiles.borderSize : 0)) * row;

				if (tile.hidden) {
					Game.cx.fillStyle = "#000";
					Game.cx.fillRect(dest_x, dest_y, Game.board.tiles.width, Game.board.tiles.height);
				} else {
					Game.cx.drawImage(Game.img, tile.sx, tile.sy,
						Game.board.tiles.width, Game.board.tiles.height,
						dest_x, dest_y,
						Game.board.tiles.width, Game.board.tiles.height);
				}
			}
		}
	}
}

// function updateFPS(fps, dt) {
// 	if (fps.time >= 500) {
// 		document.getElementById('fps').innerText =
// 			Math.round(fps.count / fps.time * 1000) + ' fps';
// 		fps.count = 0;
// 		fps.time = 0;
// 	}
// 	fps.count += 1;
// 	fps.time += dt;
// }

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