"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

export default (function () {
    function TileUtilities() {
        var renderingEngine = arguments.length <= 0 || arguments[0] === undefined ? PIXI : arguments[0];

        _classCallCheck(this, TileUtilities);

        if (renderingEngine === undefined) throw new Error("Please assign a rendering engine in the constructor before using bump.js");

        //Find out which rendering engine is being used (the default is Pixi)
        this.renderer = "";

        //If the `renderingEngine` is Pixi, set up Pixi object aliases
        if (renderingEngine.ParticleContainer && renderingEngine.Sprite) {
            this.renderingEngine = renderingEngine;
            this.renderer = "pixi";
            this.Container = this.renderingEngine.Container;
            this.TextureCache = this.renderingEngine.utils.TextureCache;
            this.Texture = this.renderingEngine.Texture;
            this.Sprite = this.renderingEngine.Sprite;
            this.Rectangle = this.renderingEngine.Rectangle;
            this.Graphics = this.renderingEngine.Graphics;
            this.loader = this.renderingEngine.loader;
            this.resources = this.renderingEngine.loader.resources;
        }
    }

    //Make a texture from a frame in another texture or image

    _createClass(TileUtilities, [{
        key: "frame",
        value: function frame(source, x, y, width, height) {

            var texture = undefined,
                imageFrame = undefined;

            //If the source is a string, it's either a texture in the
            //cache or an image file
            if (typeof source === "string") {
                if (this.TextureCache[source]) {
                    texture = new this.Texture(this.TextureCache[source]);
                }
            }

            //If the `source` is a texture,  use it
            else if (source instanceof this.Texture) {
                texture = new this.Texture(source);
            }
            if (!texture) {
                throw new Error("Please load the " + source + " texture into the cache.");
            } else {

                //Make a rectangle the size of the sub-image
                imageFrame = new this.Rectangle(x, y, width, height);
                texture.frame = imageFrame;
                return texture;
            }
        }

        //#### getIndex
        //The `getIndex` helper method
        //converts a sprite's x and y position to an array index number.
        //It returns a single index value that tells you the map array
        //index number that the sprite is in

    }, {
        key: "getIndex",
        value: function getIndex(x, y, tilewidth, tileheight, mapWidthInTiles) {
            var index = {};

            //Convert pixel coordinates to map index coordinates
            index.x = Math.floor(x / tilewidth);
            index.y = Math.floor(y / tileheight);

            //Return the index number
            return index.x + index.y * mapWidthInTiles;
        }

        /*
        #### getTile
        The `getTile` helper method
        converts a tile's index number into x/y screen
        coordinates, and capture's the tile's grid index (`gid`) number.
        It returns an object with `x`, `y`, `centerX`, `centerY`, `width`, `height`, `halfWidth`
        `halffHeight` and `gid` properties. (The `gid` number is the value that the tile has in the
        mapArray) This lets you use the returned object
        with the 2d geometric collision functions like `hitTestRectangle`
        or `rectangleCollision`
         The `world` object requires these properties:
        `x`, `y`, `tilewidth`, `tileheight` and `widthInTiles`
        */

    }, {
        key: "getTile",
        value: function getTile(index, mapArray, world) {
            var tile = {};
            tile.gid = mapArray[index];
            tile.width = world.tilewidth;
            tile.height = world.tileheight;
            tile.halfWidth = world.tilewidth / 2;
            tile.halfHeight = world.tileheight / 2;
            tile.x = index % world.widthInTiles * world.tilewidth + world.x;
            tile.y = Math.floor(index / world.widthInTiles) * world.tileheight + world.y;
            tile.gx = tile.x;
            tile.gy = tile.y;
            tile.centerX = tile.x + world.tilewidth / 2;
            tile.centery = tile.y + world.tileheight / 2;

            //Return the tile object
            return tile;
        }

        /*
        #### surroundingCells
        The `surroundingCells` helper method returns an array containing 9
        index numbers of map array cells around any given index number.
        Use it for an efficient broadphase/narrowphase collision test.
        The 2 arguments are the index number that represents the center cell,
        and the width of the map array.
        */

    }, {
        key: "surroundingCells",
        value: function surroundingCells(index, widthInTiles) {
            return [index - widthInTiles - 1, index - widthInTiles, index - widthInTiles + 1, index - 1, index, index + 1, index + widthInTiles - 1, index + widthInTiles, index + widthInTiles + 1];
        }

        //#### getPoints
        /*
        The `getPoints` method takes a sprite and returns
        an object that tells you what all its corner points are. The return
        object has four properties, each of which is an object with `x` and `y` properties:
         - `topLeft`: `x` and `y` properties describing the top left corner
        point.
        - `topRight`: `x` and `y` properties describing the top right corner
        point.
        - `bottomLeft`: `x` and `y` properties describing the bottom left corner
        point.
        - `bottomRight`: `x` and `y` properties describing the bottom right corner
        point.
         If the sprite has a `collisionArea` property that defines a
        smaller rectangular area inside the sprite, that collision
        area can be used instead for collisions instead of the sprite's dimensions. Here's
        How you could define a `collsionArea` on a sprite called `elf`:
        ```js
        elf.collisionArea = {x: 22, y: 44, width: 20, height: 20};
        ```
        Here's how you could use the `getPoints` method to find all the collision area's corner points.
        ```js
        let cornerPoints = tu.getPoints(elf.collisionArea);
        ```
        */

    }, {
        key: "getPoints",
        value: function getPoints(s) {
            var ca = s.collisionArea;
            if (ca !== undefined) {
                return {
                    topLeft: {
                        x: s.x + ca.x,
                        y: s.y + ca.y
                    },
                    topRight: {
                        x: s.x + ca.x + ca.width,
                        y: s.y + ca.y
                    },
                    bottomLeft: {
                        x: s.x + ca.x,
                        y: s.y + ca.y + ca.height
                    },
                    bottomRight: {
                        x: s.x + ca.x + ca.width,
                        y: s.y + ca.y + ca.height
                    }
                };
            } else {
                return {
                    topLeft: {
                        x: s.x,
                        y: s.y
                    },
                    topRight: {
                        x: s.x + s.width - 1,
                        y: s.y
                    },
                    bottomLeft: {
                        x: s.x,
                        y: s.y + s.height - 1
                    },
                    bottomRight: {
                        x: s.x + s.width - 1,
                        y: s.y + s.height - 1
                    }
                };
            }
        }

        //### hitTestTile
        /*
        `hitTestTile` checks for a
        collision between a sprite and a tile in any map array that you
        specify. It returns a `collision` object.
        `collision.hit` is a Boolean that tells you if a sprite is colliding
        with the tile that you're checking. `collision.index` tells you the
        map array's index number of the colliding sprite. You can check for
        a collision with the tile against "every" corner point on the
        sprite, "some" corner points, or the sprite's "center" point.
        `hitTestTile` arguments:
        sprite, array, collisionTileGridIdNumber, worldObject, spritesPointsToCheck
        ```js
        tu.hitTestTile(sprite, array, collisioGid, world, pointsToCheck);
        ```
        The `world` object (the 4th argument) has to have these properties:
        `tileheight`, `tilewidth`, `widthInTiles`.
        Here's how you could use  `hitTestTile` to check for a collision between a sprite
        called `alien` and an array of wall sprites with map gid numbers of 0.
        ```js
        let alienVsFloor = g.hitTestTile(alien, wallMapArray, 0, world, "every");
        ```
        */

    }, {
        key: "hitTestTile",
        value: function hitTestTile(sprite, mapArray, gidToCheck, world, pointsToCheck) {
            var _this = this;

            //The `checkPoints` helper function Loop through the sprite's corner points to
            //find out if they are inside an array cell that you're interested in.
            //Return `true` if they are
            var checkPoints = function checkPoints(key) {

                //Get a reference to the current point to check.
                //(`topLeft`, `topRight`, `bottomLeft` or `bottomRight` )
                var point = sprite.collisionPoints[key];

                //Find the point's index number in the map array
                collision.index = _this.getIndex(point.x, point.y, world.tilewidth, world.tileheight, world.widthInTiles);

                //Find out what the gid value is in the map position
                //that the point is currently over
                collision.gid = mapArray[collision.index];

                //If it matches the value of the gid that we're interested, in
                //then there's been a collision
                if (collision.gid === gidToCheck) {
                    return true;
                } else {
                    return false;
                }
            };

            //Assign "some" as the default value for `pointsToCheck`
            pointsToCheck = pointsToCheck || "some";

            //The collision object that will be returned by this function
            var collision = {};

            //Which points do you want to check?
            //"every", "some" or "center"?
            switch (pointsToCheck) {
                case "center":

                    //`hit` will be true only if the center point is touching
                    var point = {
                        center: {
                            x: sprite.centerX,
                            y: sprite.centerY
                        }
                    };
                    sprite.collisionPoints = point;
                    collision.hit = Object.keys(sprite.collisionPoints).some(checkPoints);
                    break;
                case "every":

                    //`hit` will be true if every point is touching
                    sprite.collisionPoints = this.getPoints(sprite);
                    collision.hit = Object.keys(sprite.collisionPoints).every(checkPoints);
                    break;
                case "some":

                    //`hit` will be true only if some points are touching
                    sprite.collisionPoints = this.getPoints(sprite);
                    collision.hit = Object.keys(sprite.collisionPoints).some(checkPoints);
                    break;
            }

            //Return the collision object.
            //`collision.hit` will be true if a collision is detected.
            //`collision.index` tells you the map array index number where the
            //collision occured
            return collision;
        }

        //### updateMap
        /*
        `updateMap` takes a map array and adds a sprite's grid index number (`gid`) to it.
        It finds the sprite's new index position, and retuns the new map array.
        You can use it to do very efficient collision detection in tile based game worlds.
        `updateMap` arguments:
        array, singleSpriteOrArrayOfSprites, worldObject
        The `world` object (the 4th argument) has to have these properties:
        `tileheight`, `tilewidth`, `widthInTiles`.
        The sprite objects have to have have these properties:
        `centerX`, `centerY`, `index`, `gid` (The number in the array that represpents the sprite)
        Here's an example of how you could use `updateMap` in your game code like this:

            blockLayer.data = updateMap(blockLayer.data, blockLayer.children, world);
         The `blockLayer.data` array would now contain the new index position numbers of all the
        child sprites on that layer.
        */

    }, {
        key: "updateMap",
        value: function updateMap(mapArray, spritesToUpdate, world) {
            var _this2 = this;

            //First create a map a new array filled with zeros.
            //The new map array will be exactly the same size as the original
            var newMapArray = mapArray.map(function (gid) {
                gid = 0;
                return gid;
            });

            //Is `spriteToUpdate` an array of sprites?
            if (spritesToUpdate instanceof Array) {
                (function () {

                    //Get the index number of each sprite in the `spritesToUpdate` array
                    //and add the sprite's `gid` to the matching index on the map
                    var self = _this2;
                    spritesToUpdate.forEach(function (sprite) {

                        //Find the new index number
                        sprite.index = self.getIndex(sprite.centerX, sprite.centerY, world.tilewidth, world.tileheight, world.widthInTiles);

                        //Add the sprite's `gid` number to the correct index on the map
                        newMapArray[sprite.index] = sprite.gid;
                    });
                })();
            }

            //Is `spritesToUpdate` just a single sprite?
            else {
                var sprite = spritesToUpdate;
                //Find the new index number
                sprite.index = this.getIndex(sprite.centerX, sprite.centerY, world.tilewidth, world.tileheight, world.widthInTiles);

                //Add the sprite's `gid` number to the correct index on the map
                newMapArray[sprite.index] = sprite.gid;
            }

            //Return the new map array to replace the previous one
            return newMapArray;
        }

        /*
        ###makeTiledWorld
         `makeTiledWorld` is a quick and easy way to display a game world designed in
        Tiled Editor. Supply `makeTiledWorld` with 2 **string arguments**:

        1. A JSON file generated by Tiled Editor.
        2. A source image that represents the tile set you used to create the Tiled Editor world.
        ```js
        let world = makeTiledWorld("tiledEditorMapData.json", "tileset.png");
        ```
        (Note: `makeTiledWorld` looks for the JSON data file in Pixi's `loader.resources` object. So,
        make sure you've loaded the JSON file using Pixi's `loader`.)
         `makeTiledWorld` will return a Pixi `Container` that contains all the things in your Tiled Editor
        map as Pixi sprites.
         All the image tiles you create in Tiled Editor are automatically converted into Pixi sprites
        for you by `makeTiledWorld`. You can access all of them using two methods: `getObject` (for
        single sprites) and `getObjects` (with an "s") for multiple sprites. Let's find out how they work.

        ####world.getObject
         Tile Editor lets you assign a "name" properties any object.
        You can access any sprite by this name using the `getObject` method. `getObject` searches for and
        returns a sprite in the `world` that has the same `name` property that you assigned
        in Tiled Editor. Here's how to use `getObject` to look for an object called "alien"
        in the Tiled map data and assign it to a variable called `alien`
        ```js
        let alien = world.getObject("alien");
        ```
        `alien` is now an ordinary Pixi sprite that you can control just like any other Pixi
        sprite in your games.
         #### Creating sprites from generic objects
         Tiled Editor lets you create generic objects. These are objects that don't have images associated
        with them. Generic objects are handy to use, because they let you create complex game objects inside
        Tiled Editor, as pure data. You can then use that data your game code to build complex game objects.
         For example, imagine that you want to create a complex animated walking sprite called "elf".
        First, create the elf object in Tiled Editor as a generic object, but don't assign any image tiles
        to it. Next, in your game code, create a new Pixi MovieClip called `elf` and give it any textures you want
        to use for its animation states.
        ```js
        //Create a new Pixi MovieClip sprite
        let elf = new PIXI.MovieClip(elfSpriteTextures);
        ```
        Then use the `x` and `y` data from the generic "elf" object you created in Tiled Editor to position the
        `elf` sprite.
        ```js
        elf.x = world.getObject("elf").x;
        elf.y = world.getObject("elf").y;
        ```
        This is a simple example, but you could make very complex data objects in Tiled Editor and
        use them to build complex sprites in the same way.
         ####Accessing Tiled Editor layer groups

        Tiled Editor lets you create **layer groups**. Each layer group you create
        in Tiled Editor is automatically converted by `makeTiledWorld` into a Pixi `Container`
        object. You can access those containers using `getObject` to extract the layer group
        container.
         Here's how you could extract the layer group called "objects" and add the
        `elf` sprite to it.
        ```js
        let objectsLayer = world.getObject("objects");
        objectsLayer.addChild(elf);
        ```
        If you want to add the sprite to a different world layer, you can do it like this:
        ```js
        world.getObject("treeTops").addChild(elf);
        ```
        If you want to access all the sprites in a specific Tiled Editor layer, just supply
        `getObject` with the name of the layer. For example, if the layer name is "items", you
        can access it like this:
        ```js
        let itemsLayer = world.getObject("items");
        ```
        `itemsLayer` is now a Pixi container with a `children` array that contains all the sprites
        on that layer.
         To be safe, clone this array to create a new version
        that doesn't point to the original data file:
        ```js
        items = itemsLayer.children.slice(0);
        ```
        You can now manipulate the `items` array freely without worrying about changing
        the original array. This can possibly help prevent some weird bugs in a complex game.
         ###Finding the "gid" values
         Tiled Editor uses "gid" numbers to identify different kinds of things in the world.
        If you ever need to extract sprites with specific `gid` numbers in a
        layer that contains different kinds of things, you can do it like this:
        ```js
        let items = itemsLayer.children.map(sprite => {
          if (sprite.gid !== 0) return sprite;
        });
        ```
        Every sprite created by `makeTiledWorld` has a `gid` property with a value that matches its
        Tiled Editor "gid" value.
         ####Accessing a layer's "data" array
         Tiled Editor's layers have a `data` property
        that is an array containing all the grid index numbers (`gid`) of
        the tiles in that array. Imagine that you've got a layer full of similar
        tiles representing the walls in a game. How do you access the array
        containing all the "gid" numbers of the wall sprites in that layer? If the layer's name is called "wallLayer", you
        can access the `wallLayer`'s `data` array of sprites like this:
        ```js
        wallMapArray = world.getObject("wallLayer").data;
        ```
        `wallMapArray` is now an array of "gid" numbers referring to all the sprites on that
        layer. You can now use this data for collision detection, or doing any other kind
        of world building.
         ###world.getObjects
         There's another method called `getObjects` (with an "s"!) that lets you extract
        an array of sprites from the Tiled Editor data. Imagine that you created three
        game objects in Tiled Editor called "marmot", "skull" and "heart". `makeTiledWorld`
        automatically turns them into sprites, and you can access
        all of them as array of sprites using `getObjects` like this:
        ```js
        let gameItemsArray = world.getObjects("marmot", "skull", "heart");
        ```
        */

    }, {
        key: "makeTiledWorld",
        value: function makeTiledWorld(jsonTiledMap, tileset) {
            var _this3 = this;

            //Create a group called `world` to contain all the layers, sprites
            //and objects from the `tiledMap`. The `world` object is going to be
            //returned to the main game program
            var tiledMap = PIXI.loader.resources[jsonTiledMap].data;
            var world = new this.Container();

            world.tileheight = tiledMap.tileheight;
            world.tilewidth = tiledMap.tilewidth;

            //Calculate the `width` and `height` of the world, in pixels
            world.worldWidth = tiledMap.width * tiledMap.tilewidth;
            world.worldHeight = tiledMap.height * tiledMap.tileheight;

            //Get a reference to the world's height and width in
            //tiles, in case you need to know this later (you will!)
            world.widthInTiles = tiledMap.width;
            world.heightInTiles = tiledMap.height;

            //Create an `objects` array to store references to any
            //named objects in the map. Named objects all have
            //a `name` property that was assigned in Tiled Editor
            world.objects = [];

            //The optional spacing (padding) around each tile
            //This is to account for spacing around tiles
            //that's commonly used with texture atlas tilesets. Set the
            //`spacing` property when you create a new map in Tiled Editor
            var spacing = tiledMap.tilesets[0].spacing;

            //Figure out how many columns there are on the tileset.
            //This is the width of the image, divided by the width
            //of each tile, plus any optional spacing thats around each tile
            var numberOfTilesetColumns = Math.floor(tiledMap.tilesets[0].imagewidth / (tiledMap.tilewidth + spacing));

            //Loop through all the map layers
            tiledMap.layers.forEach(function (tiledLayer) {

                //Make a group for this layer and copy
                //all of the layer properties onto it.
                var layerGroup = new _this3.Container();

                Object.keys(tiledLayer).forEach(function (key) {
                    //Add all the layer's properties to the group, except the
                    //width and height (because the group will work those our for
                    //itself based on its content).
                    if (key !== "width" && key !== "height") {
                        layerGroup[key] = tiledLayer[key];
                    }
                });

                //Set the width and height of the layer to
                //the `world`'s width and height
                //layerGroup.width = world.width;
                //layerGroup.height = world.height;

                //Translate `opacity` to `alpha`
                layerGroup.alpha = tiledLayer.opacity;

                //Add the group to the `world`
                world.addChild(layerGroup);

                //Push the group into the world's `objects` array
                //So you can access it later
                world.objects.push(layerGroup);

                //Is this current layer a `tilelayer`?
                if (tiledLayer.type === "tilelayer") {

                    //Loop through the `data` array of this layer
                    tiledLayer.data.forEach(function (gid, index) {
                        var tileSprite = undefined,
                            texture = undefined,
                            mapX = undefined,
                            mapY = undefined,
                            tilesetX = undefined,
                            tilesetY = undefined,
                            mapColumn = undefined,
                            mapRow = undefined,
                            tilesetColumn = undefined,
                            tilesetRow = undefined;

                        //If the grid id number (`gid`) isn't zero, create a sprite
                        if (gid !== 0) {
                            (function () {

                                //Figure out the map column and row number that we're on, and then
                                //calculate the grid cell's x and y pixel position.
                                mapColumn = index % world.widthInTiles;
                                mapRow = Math.floor(index / world.widthInTiles);
                                mapX = mapColumn * world.tilewidth;
                                mapY = mapRow * world.tileheight;

                                //Figure out the column and row number that the tileset
                                //image is on, and then use those values to calculate
                                //the x and y pixel position of the image on the tileset
                                tilesetColumn = (gid - 1) % numberOfTilesetColumns;
                                tilesetRow = Math.floor((gid - 1) / numberOfTilesetColumns);
                                tilesetX = tilesetColumn * world.tilewidth;
                                tilesetY = tilesetRow * world.tileheight;

                                //Compensate for any optional spacing (padding) around the tiles if
                                //there is any. This bit of code accumlates the spacing offsets from the
                                //left side of the tileset and adds them to the current tile's position
                                if (spacing > 0) {
                                    tilesetX += spacing + spacing * ((gid - 1) % numberOfTilesetColumns);
                                    tilesetY += spacing + spacing * Math.floor((gid - 1) / numberOfTilesetColumns);
                                }

                                //Use the above values to create the sprite's image from
                                //the tileset image
                                texture = _this3.frame(tileset, tilesetX, tilesetY, world.tilewidth, world.tileheight);

                                //I've dedcided that any tiles that have a `name` property are important
                                //and should be accessible in the `world.objects` array.

                                var tileproperties = tiledMap.tilesets[0].tileproperties,
                                    key = String(gid - 1);

                                //If the JSON `tileproperties` object has a sub-object that
                                //matches the current tile, and that sub-object has a `name` property,
                                //then create a sprite and assign the tile properties onto
                                //the sprite
                                if (tileproperties && tileproperties[key] && tileproperties[key].name) {

                                    //Make a sprite
                                    tileSprite = new _this3.Sprite(texture);

                                    //Copy all of the tile's properties onto the sprite
                                    //(This includes the `name` property)
                                    Object.keys(tileproperties[key]).forEach(function (property) {

                                        //console.log(tileproperties[key][property])
                                        tileSprite[property] = tileproperties[key][property];
                                    });

                                    //Push the sprite into the world's `objects` array
                                    //so that you can access it by `name` later
                                    world.objects.push(tileSprite);
                                }

                                //If the tile doesn't have a `name` property, just use it to
                                //create an ordinary sprite (it will only need one texture)
                                else {
                                    tileSprite = new _this3.Sprite(texture);
                                }

                                //Position the sprite on the map
                                tileSprite.x = mapX;
                                tileSprite.y = mapY;

                                //Make a record of the sprite's index number in the array
                                //(We'll use this for collision detection later)
                                tileSprite.index = index;

                                //Make a record of the sprite's `gid` on the tileset.
                                //This will also be useful for collision detection later
                                tileSprite.gid = gid;

                                //Add the sprite to the current layer group
                                layerGroup.addChild(tileSprite);
                            })();
                        }
                    });
                }

                //Is this layer an `objectgroup`?
                if (tiledLayer.type === "objectgroup") {
                    tiledLayer.objects.forEach(function (object) {

                        //We're just going to capture the object's properties
                        //so that we can decide what to do with it later

                        //Get a reference to the layer group the object is in
                        object.group = layerGroup;

                        //Because this is an object layer, it doesn't contain any
                        //sprites, just data object. That means it won't be able to
                        //calucalte its own height and width. To help it out, give
                        //the `layerGroup` the same `width` and `height` as the `world`
                        //layerGroup.width = world.width;
                        //layerGroup.height = world.height;

                        //Push the object into the world's `objects` array
                        world.objects.push(object);
                    });
                }
            });

            //Search functions
            //`world.getObject` and `world.getObjects`  search for and return
            //any sprites or objects in the `world.objects` array.
            //Any object that has a `name` propery in
            //Tiled Editor will show up in a search.
            //`getObject` gives you a single object, `getObjects` gives you an array
            //of objects.
            //`getObject` returns the actual search function, so you
            //can use the following format to directly access a single object:
            //sprite.x = world.getObject("anySprite").x;
            //sprite.y = world.getObject("anySprite").y;

            world.getObject = function (objectName) {
                var searchForObject = function searchForObject() {
                    var foundObject = undefined;
                    world.objects.some(function (object) {
                        if (object.name && object.name === objectName) {
                            foundObject = object;
                            return true;
                        }
                    });
                    if (foundObject) {
                        return foundObject;
                    } else {
                        throw new Error("There is no object with the property name: " + objectName);
                    }
                };

                //Return the search function
                return searchForObject();
            };

            world.getObjects = function (objectNames) {
                var foundObjects = [];
                world.objects.forEach(function (object) {
                    if (object.name && objectNames.indexOf(object.name) !== -1) {
                        foundObjects.push(object);
                    }
                });
                if (foundObjects.length > 0) {
                    return foundObjects;
                } else {
                    throw new Error("I could not find those objects");
                }
                return foundObjects;
            };

            //That's it, we're done!
            //Finally, return the `world` object back to the game program
            return world;
        }

        /* Isometric tile utilities */

        /*
        ### byDepth
        And array `sort` function that depth-sorts sprites according to
        their `z` properties
        */

    }, {
        key: "byDepth",
        value: function byDepth(a, b) {
            //Calculate the depths of `a` and `b`
            //(add `1` to `a.z` and `b.x` to avoid multiplying by 0)
            a.depth = (a.cartX + a.cartY) * (a.z + 1);
            b.depth = (b.cartX + b.cartY) * (b.z + 1);

            //Move sprites with a lower depth to a higher position in the array
            if (a.depth < b.depth) {
                return -1;
            } else if (a.depth > b.depth) {
                return 1;
            } else {
                return 0;
            }
        }

        /*
        ### hitTestIsoTile
        Same API as `hitTestTile`, except that it works with isometric sprites.
        Make sure that your `world` object has properties called
        `cartTileWidth` and `cartTileHeight` that define the Cartesian with and
        height of your tile cells, in pixels.
         */

    }, {
        key: "hitTestIsoTile",
        value: function hitTestIsoTile(sprite, mapArray, gidToCheck, world, pointsToCheck) {
            var _this4 = this;

            //The `checkPoints` helper function Loop through the sprite's corner points to
            //find out if they are inside an array cell that you're interested in.
            //Return `true` if they are
            var checkPoints = function checkPoints(key) {

                //Get a reference to the current point to check.
                //(`topLeft`, `topRight`, `bottomLeft` or `bottomRight` )
                var point = sprite.collisionPoints[key];

                //Find the point's index number in the map array
                collision.index = _this4.getIndex(point.x, point.y, world.cartTilewidth, world.cartTileheight, world.widthInTiles);

                //Find out what the gid value is in the map position
                //that the point is currently over
                collision.gid = mapArray[collision.index];

                //If it matches the value of the gid that we're interested, in
                //then there's been a collision
                if (collision.gid === gidToCheck) {
                    return true;
                } else {
                    return false;
                }
            };

            //Assign "some" as the default value for `pointsToCheck`
            pointsToCheck = pointsToCheck || "some";

            //The collision object that will be returned by this function
            var collision = {};

            //Which points do you want to check?
            //"every", "some" or "center"?
            switch (pointsToCheck) {
                case "center":

                    //`hit` will be true only if the center point is touching
                    var point = {
                        center: {
                            //x: sprite.centerX,
                            //y: sprite.centerY
                            x: s.cartX + ca.x + ca.width / 2,
                            y: s.cartY + ca.y + ca.height / 2
                        }
                    };
                    sprite.collisionPoints = point;
                    collision.hit = Object.keys(sprite.collisionPoints).some(checkPoints);
                    break;
                case "every":

                    //`hit` will be true if every point is touching
                    sprite.collisionPoints = this.getIsoPoints(sprite);
                    collision.hit = Object.keys(sprite.collisionPoints).every(checkPoints);
                    break;
                case "some":

                    //`hit` will be true only if some points are touching
                    sprite.collisionPoints = this.getIsoPoints(sprite);
                    collision.hit = Object.keys(sprite.collisionPoints).some(checkPoints);
                    break;
            }

            //Return the collision object.
            //`collision.hit` will be true if a collision is detected.
            //`collision.index` tells you the map array index number where the
            //collision occured
            return collision;
        }

        /*
        ### getIsoPoints
        The isomertic version of `getPoints`
        */

    }, {
        key: "getIsoPoints",
        value: function getIsoPoints(s) {
            var ca = s.collisionArea;
            if (ca !== undefined) {
                return {
                    topLeft: {
                        x: s.cartX + ca.x,
                        y: s.cartY + ca.y
                    },
                    topRight: {
                        x: s.cartX + ca.x + ca.width,
                        y: s.cartY + ca.y
                    },
                    bottomLeft: {
                        x: s.cartX + ca.x,
                        y: s.cartY + ca.y + ca.height
                    },
                    bottomRight: {
                        x: s.cartX + ca.x + ca.width,
                        y: s.cartY + ca.y + ca.height
                    }
                };
            } else {
                return {
                    topLeft: {
                        x: s.cartX,
                        y: s.cartY
                    },
                    topRight: {
                        x: s.cartX + s.cartWidth - 1,
                        y: s.cartY
                    },
                    bottomLeft: {
                        x: s.cartX,
                        y: s.cartY + s.cartHeight - 1
                    },
                    bottomRight: {
                        x: s.cartX + s.cartWidth - 1,
                        y: s.cartY + s.cartHeight - 1
                    }
                };
            }
        }

        /*
        ### makeIsoPointer
        Used to add a isometric properties to any mouse/touch `pointer` object with
        `x` and `y` properties. Supply `makeIsoPointer` with the pointer object and
        the isometric `world` object
        */

        //Create some useful properties on the pointer

    }, {
        key: "makeIsoPointer",
        value: function makeIsoPointer(pointer, world) {
            Object.defineProperties(pointer, {

                //The isometric's world's Cartesian coordiantes
                cartX: {
                    get: function get() {
                        var x = (2 * this.y + this.x - (2 * world.y + world.x)) / 2 - world.cartTilewidth / 2;

                        return x;
                    },

                    enumerable: true,
                    configurable: true
                },
                cartY: {
                    get: function get() {
                        var y = (2 * this.y - this.x - (2 * world.y - world.x)) / 2 + world.cartTileheight / 2;

                        return y;
                    },

                    enumerable: true,
                    configurable: true
                },

                //The tile's column and row in the array
                column: {
                    get: function get() {
                        return Math.floor(this.cartX / world.cartTilewidth);
                    },

                    enumerable: true,
                    configurable: true
                },
                row: {
                    get: function get() {
                        return Math.floor(this.cartY / world.cartTileheight);
                    },

                    enumerable: true,
                    configurable: true
                },

                //The tile's index number in the array
                index: {
                    get: function get() {
                        var index = {};

                        //Convert pixel coordinates to map index coordinates
                        index.x = Math.floor(this.cartX / world.cartTilewidth);
                        index.y = Math.floor(this.cartY / world.cartTileheight);

                        //Return the index number
                        return index.x + index.y * world.widthInTiles;
                    },

                    enumerable: true,
                    configurable: true
                }
            });
        }

        /*
        ### isoRectangle
        A function for creating a simple isometric diamond
        shaped rectangle using Pixi's graphics library
        */

    }, {
        key: "isoRectangle",
        value: function isoRectangle(width, height, fillStyle) {

            //Figure out the `halfHeight` value
            var halfHeight = height / 2;

            //Draw the flattened and rotated square (diamond shape)
            var rectangle = new this.Graphics();
            rectangle.beginFill(fillStyle);
            rectangle.moveTo(0, 0);
            rectangle.lineTo(width, halfHeight);
            rectangle.lineTo(0, height);
            rectangle.lineTo(-width, halfHeight);
            rectangle.lineTo(0, 0);
            rectangle.endFill();

            //Generate a texture from the rectangle
            var texture = rectangle.generateTexture();

            //Use the texture to create a sprite
            var sprite = new this.Sprite(texture);

            //Return it to the main program
            return sprite;
        }

        /*
        ### addIsoProperties
        Add properties to a sprite to help work between Cartesian
        and isometric properties: `isoX`, `isoY`, `cartX`,
        `cartWidth` and `cartHeight`.
        */

    }, {
        key: "addIsoProperties",
        value: function addIsoProperties(sprite, x, y, width, height) {

            //Cartisian (flat 2D) properties
            sprite.cartX = x;
            sprite.cartY = y;
            sprite.cartWidth = width;
            sprite.cartHeight = height;

            //Add a getter/setter for the isometric properties
            Object.defineProperties(sprite, {
                isoX: {
                    get: function get() {
                        return this.cartX - this.cartY;
                    },

                    enumerable: true,
                    configurable: true
                },
                isoY: {
                    get: function get() {
                        return (this.cartX + this.cartY) / 2;
                    },

                    enumerable: true,
                    configurable: true
                }
            });
        }

        /*
        ### makeIsoTiledWorld
        Make an isometric world from TiledEditor map data. Uses the same API as `makeTiledWorld`
         */

    }, {
        key: "makeIsoTiledWorld",
        value: function makeIsoTiledWorld(jsonTiledMap, tileset) {
            var _this5 = this;

            //Create a group called `world` to contain all the layers, sprites
            //and objects from the `tiledMap`. The `world` object is going to be
            //returned to the main game program
            var tiledMap = PIXI.loader.resources[jsonTiledMap].data;

            //A. You need to add three custom properties to your Tiled Editor
            //map: `cartTilewidth`,`cartTileheight` and `tileDepth`. They define the Cartesian
            //dimesions of the tiles (32x32x64).
            //Check to make sure that these custom properties exist
            if (!tiledMap.properties.cartTilewidth && !tiledMap.properties.cartTileheight && !tiledMao.properties.tileDepth) {
                throw new Error("Set custom cartTilewidth, cartTileheight and tileDepth map properties in Tiled Editor");
            }

            //Create the `world` container
            var world = new this.Container();

            //B. Set the `tileHeight` to the `tiledMap`'s `tileDepth` property
            //so that it matches the pixel height of the sprite tile image
            world.tileheight = parseInt(tiledMap.properties.tileDepth);
            world.tilewidth = tiledMap.tilewidth;

            //C. Define the Cartesian dimesions of each tile
            world.cartTileheight = parseInt(tiledMap.properties.cartTileheight);
            world.cartTilewidth = parseInt(tiledMap.properties.cartTilewidth);

            //D. Calculate the `width` and `height` of the world, in pixels
            //using the `world.cartTileHeight` and `world.cartTilewidth`
            //values
            world.worldWidth = tiledMap.width * world.cartTilewidth;
            world.worldHeight = tiledMap.height * world.cartTileheight;

            //Get a reference to the world's height and width in
            //tiles, in case you need to know this later (you will!)
            world.widthInTiles = tiledMap.width;
            world.heightInTiles = tiledMap.height;

            //Create an `objects` array to store references to any
            //named objects in the map. Named objects all have
            //a `name` property that was assigned in Tiled Editor
            world.objects = [];

            //The optional spacing (padding) around each tile
            //This is to account for spacing around tiles
            //that's commonly used with texture atlas tilesets. Set the
            //`spacing` property when you create a new map in Tiled Editor
            var spacing = tiledMap.tilesets[0].spacing;

            //Figure out how many columns there are on the tileset.
            //This is the width of the image, divided by the width
            //of each tile, plus any optional spacing thats around each tile
            var numberOfTilesetColumns = Math.floor(tiledMap.tilesets[0].imagewidth / (tiledMap.tilewidth + spacing));

            //E. A `z` property to help track which depth level the sprites are on
            var z = 0;

            //Loop through all the map layers
            tiledMap.layers.forEach(function (tiledLayer) {

                //Make a group for this layer and copy
                //all of the layer properties onto it.
                var layerGroup = new _this5.Container();

                Object.keys(tiledLayer).forEach(function (key) {
                    //Add all the layer's properties to the group, except the
                    //width and height (because the group will work those our for
                    //itself based on its content).
                    if (key !== "width" && key !== "height") {
                        layerGroup[key] = tiledLayer[key];
                    }
                });

                //Translate `opacity` to `alpha`
                layerGroup.alpha = tiledLayer.opacity;

                //Add the group to the `world`
                world.addChild(layerGroup);

                //Push the group into the world's `objects` array
                //So you can access it later
                world.objects.push(layerGroup);

                //Is this current layer a `tilelayer`?
                if (tiledLayer.type === "tilelayer") {

                    //Loop through the `data` array of this layer
                    tiledLayer.data.forEach(function (gid, index) {
                        var tileSprite = undefined,
                            texture = undefined,
                            mapX = undefined,
                            mapY = undefined,
                            tilesetX = undefined,
                            tilesetY = undefined,
                            mapColumn = undefined,
                            mapRow = undefined,
                            tilesetColumn = undefined,
                            tilesetRow = undefined;

                        //If the grid id number (`gid`) isn't zero, create a sprite
                        if (gid !== 0) {
                            (function () {

                                //Figure out the map column and row number that we're on, and then
                                //calculate the grid cell's x and y pixel position.
                                mapColumn = index % world.widthInTiles;
                                mapRow = Math.floor(index / world.widthInTiles);

                                //F. Use the Cartesian values to find the
                                //`mapX` and `mapY` values
                                mapX = mapColumn * world.cartTilewidth;
                                mapY = mapRow * world.cartTileheight;

                                //Figure out the column and row number that the tileset
                                //image is on, and then use those values to calculate
                                //the x and y pixel position of the image on the tileset
                                tilesetColumn = (gid - 1) % numberOfTilesetColumns;
                                tilesetRow = Math.floor((gid - 1) / numberOfTilesetColumns);
                                tilesetX = tilesetColumn * world.tilewidth;
                                tilesetY = tilesetRow * world.tileheight;

                                //Compensate for any optional spacing (padding) around the tiles if
                                //there is any. This bit of code accumlates the spacing offsets from the
                                //left side of the tileset and adds them to the current tile's position
                                if (spacing > 0) {
                                    tilesetX += spacing + spacing * ((gid - 1) % numberOfTilesetColumns);
                                    tilesetY += spacing + spacing * Math.floor((gid - 1) / numberOfTilesetColumns);
                                }

                                //Use the above values to create the sprite's image from
                                //the tileset image
                                texture = _this5.frame(tileset, tilesetX, tilesetY, world.tilewidth, world.tileheight);

                                //I've dedcided that any tiles that have a `name` property are important
                                //and should be accessible in the `world.objects` array.

                                var tileproperties = tiledMap.tilesets[0].tileproperties,
                                    key = String(gid - 1);

                                //If the JSON `tileproperties` object has a sub-object that
                                //matches the current tile, and that sub-object has a `name` property,
                                //then create a sprite and assign the tile properties onto
                                //the sprite
                                if (tileproperties[key] && tileproperties[key].name) {

                                    //Make a sprite
                                    tileSprite = new _this5.Sprite(texture);

                                    //Copy all of the tile's properties onto the sprite
                                    //(This includes the `name` property)
                                    Object.keys(tileproperties[key]).forEach(function (property) {

                                        //console.log(tileproperties[key][property])
                                        tileSprite[property] = tileproperties[key][property];
                                    });

                                    //Push the sprite into the world's `objects` array
                                    //so that you can access it by `name` later
                                    world.objects.push(tileSprite);
                                }

                                //If the tile doesn't have a `name` property, just use it to
                                //create an ordinary sprite (it will only need one texture)
                                else {
                                    tileSprite = new _this5.Sprite(texture);
                                }

                                //G. Add isometric properties to the sprite
                                _this5.addIsoProperties(tileSprite, mapX, mapY, world.cartTilewidth, world.cartTileheight);

                                //H. Use the isometric position to add the sprite to the world
                                tileSprite.x = tileSprite.isoX;
                                tileSprite.y = tileSprite.isoY;
                                tileSprite.z = z;

                                //Make a record of the sprite's index number in the array
                                //(We'll use this for collision detection later)
                                tileSprite.index = index;

                                //Make a record of the sprite's `gid` on the tileset.
                                //This will also be useful for collision detection later
                                tileSprite.gid = gid;

                                //Add the sprite to the current layer group
                                layerGroup.addChild(tileSprite);
                            })();
                        }
                    });
                }

                //Is this layer an `objectgroup`?
                if (tiledLayer.type === "objectgroup") {
                    tiledLayer.objects.forEach(function (object) {

                        //We're just going to capture the object's properties
                        //so that we can decide what to do with it later

                        //Get a reference to the layer group the object is in
                        object.group = layerGroup;

                        //Push the object into the world's `objects` array
                        world.objects.push(object);
                    });
                }

                //I. Add 1 to the z index (the first layer will have a z index of `1`)
                z += 1;
            });

            //Search functions
            //`world.getObject` and `world.getObjects`  search for and return
            //any sprites or objects in the `world.objects` array.
            //Any object that has a `name` propery in
            //Tiled Editor will show up in a search.
            //`getObject` gives you a single object, `getObjects` gives you an array
            //of objects.
            //`getObject` returns the actual search function, so you
            //can use the following format to directly access a single object:
            //sprite.x = world.getObject("anySprite").x;
            //sprite.y = world.getObject("anySprite").y;

            world.getObject = function (objectName) {
                var searchForObject = function searchForObject() {
                    var foundObject = undefined;
                    world.objects.some(function (object) {
                        if (object.name && object.name === objectName) {
                            foundObject = object;
                            return true;
                        }
                    });
                    if (foundObject) {
                        return foundObject;
                    } else {
                        throw new Error("There is no object with the property name: " + objectName);
                    }
                };

                //Return the search function
                return searchForObject();
            };

            world.getObjects = function (objectNames) {
                var foundObjects = [];
                world.objects.forEach(function (object) {
                    if (object.name && objectNames.indexOf(object.name) !== -1) {
                        foundObjects.push(object);
                    }
                });
                if (foundObjects.length > 0) {
                    return foundObjects;
                } else {
                    throw new Error("I could not find those objects");
                }
                return foundObjects;
            };

            //That's it, we're done!
            //Finally, return the `world` object back to the game program
            return world;
        }

        /*
        //### The `shortestPath` function

        An A-Star search algorithm that returns an array of grid index numbers that
        represent the shortest path between two points on a map. Use it like this:

        let shortestPath = tu.shortestPath(
          startIndex,               //The start map index
          destinationIndex,         //The destination index
          mapArray,                 //The map array
          mapWidthInTiles,          //Map wdith, in tiles
          [1,2],                    //Obstacle gid array
          "manhattan"               //Heuristic to use: "manhatten", "euclidean" or "diagonal"
        );

        */

    }, {
        key: "shortestPath",
        value: function shortestPath(startIndex, destinationIndex, mapArray, mapWidthInTiles) {
            var obstacleGids = arguments.length <= 4 || arguments[4] === undefined ? [] : arguments[4];
            var heuristic = arguments.length <= 5 || arguments[5] === undefined ? "manhattan" : arguments[5];
            var useDiagonalNodes = arguments.length <= 6 || arguments[6] === undefined ? true : arguments[6];

            //The `nodes` function creates the array of node objects
            var nodes = function nodes(mapArray, mapWidthInTiles) {
                return mapArray.map(function (cell, index) {

                    //Figure out the row and column of this cell
                    var column = index % mapWidthInTiles;
                    var row = Math.floor(index / mapWidthInTiles);

                    //The node object
                    return node = {
                        f: 0,
                        g: 0,
                        h: 0,
                        parent: null,
                        column: column,
                        row: row,
                        index: index
                    };
                });
            };

            //Initialize theShortestPath array
            var theShortestPath = [];

            //Initialize the node map
            var nodeMap = nodes(mapArray, mapWidthInTiles);

            //Initialize the closed and open list arrays
            var closedList = [];
            var openList = [];

            //Declare the "costs" of travelling in straight or
            //diagonal lines
            var straightCost = 10;
            var diagonalCost = 14;

            //Get the start node
            var startNode = nodeMap[startIndex];

            //Get the current center node. The first one will
            //match the path's start position
            var centerNode = startNode;

            //Push the `centerNode` into the `openList`, because
            //it's the first node that we're going to check
            openList.push(centerNode);

            //Get the current destination node. The first one will
            //match the path's end position
            var destinationNode = nodeMap[destinationIndex];

            //All the nodes that are surrounding the current map index number
            var surroundingNodes = function surroundingNodes(index, mapArray, mapWidthInTiles, useDiagonalNodes) {

                //Find out what all the surrounding nodes are, including those that
                //might be beyond the borders of the map
                var allSurroundingNodes = [nodeMap[index - mapWidthInTiles - 1], nodeMap[index - mapWidthInTiles], nodeMap[index - mapWidthInTiles + 1], nodeMap[index - 1], nodeMap[index + 1], nodeMap[index + mapWidthInTiles - 1], nodeMap[index + mapWidthInTiles], nodeMap[index + mapWidthInTiles + 1]];

                //Optionaly exlude the diagonal nodes, which is often perferable
                //for 2D maze games
                var crossSurroundingNodes = [nodeMap[index - mapWidthInTiles], nodeMap[index - 1], nodeMap[index + 1], nodeMap[index + mapWidthInTiles]];

                //Use either `allSurroundingNodes` or `crossSurroundingNodes` depending
                //on the the value of `useDiagonalNodes`
                var nodesToCheck = undefined;
                if (useDiagonalNodes) {
                    nodesToCheck = allSurroundingNodes;
                } else {
                    nodesToCheck = crossSurroundingNodes;
                }

                //Find the valid sourrounding nodes, which are ones inside
                //the map border that don't incldue obstacles. Change `allSurroundingNodes`
                //to `crossSurroundingNodes` to prevent the path from choosing diagonal routes
                var validSurroundingNodes = nodesToCheck.filter(function (node) {

                    //The node will be beyond the top and bottom edges of the
                    //map if it is `undefined`
                    var nodeIsWithinTopAndBottomBounds = node !== undefined;

                    //Only return nodes that are within the top and bottom map bounds
                    if (nodeIsWithinTopAndBottomBounds) {

                        //Some Boolean values that tell us whether the current map index is on
                        //the left or right border of the map, and whether any of the nodes
                        //surrounding that index extend beyond the left and right borders
                        var indexIsOnLeftBorder = index % mapWidthInTiles === 0;
                        var indexIsOnRightBorder = (index + 1) % mapWidthInTiles === 0;
                        var nodeIsBeyondLeftBorder = node.column % (mapWidthInTiles - 1) === 0 && node.column !== 0;
                        var nodeIsBeyondRightBorder = node.column % mapWidthInTiles === 0;

                        //Find out whether of not the node contains an obstacle by looping
                        //through the obstacle gids and and returning `true` if it
                        //finds any at this node's location
                        var nodeContainsAnObstacle = obstacleGids.some(function (obstacle) {
                            return mapArray[node.index] === obstacle;
                        });

                        //If the index is on the left border and any nodes surrounding it are beyond the
                        //left border, don't return that node
                        if (indexIsOnLeftBorder) {
                            //console.log("left border")
                            return !nodeIsBeyondLeftBorder;
                        }

                        //If the index is on the right border and any nodes surrounding it are beyond the
                        //right border, don't return that node
                        else if (indexIsOnRightBorder) {
                            //console.log("right border")
                            return !nodeIsBeyondRightBorder;
                        }

                        //Return `true` if the node doesn't contain any obstacles
                        else if (nodeContainsAnObstacle) {
                            return false;
                        }

                        //The index must be inside the area defined by the left and right borders,
                        //so return the node
                        else {
                            //console.log("map interior")
                            return true;
                        }
                    }
                });

                //console.log(validSurroundingNodes)
                //Return the array of `validSurroundingNodes`
                return validSurroundingNodes;
            };

            //Diagnostic
            //console.log(nodeMap);
            //console.log(centerNode);
            //console.log(destinationNode);
            //console.log(wallMapArray);
            //console.log(surroundingNodes(86, mapArray, mapWidthInTiles));

            //Heuristic methods
            //1. Manhattan
            var manhattan = function manhattan(testNode, destinationNode) {
                var h = Math.abs(testNode.row - destinationNode.row) * straightCost + Math.abs(testNode.column - destinationNode.column) * straightCost;
                return h;
            };

            //2. Euclidean
            var euclidean = function euclidean(testNode, destinationNode) {
                var vx = destinationNode.column - testNode.column,
                    vy = destinationNode.row - testNode.row,
                    h = Math.floor(Math.sqrt(vx * vx + vy * vy) * straightCost);
                return h;
            };

            //3. Diagonal
            var diagonal = function diagonal(testNode, destinationNode) {
                var vx = Math.abs(destinationNode.column - testNode.column),
                    vy = Math.abs(destinationNode.row - testNode.row),
                    h = 0;

                if (vx > vy) {
                    h = Math.floor(diagonalCost * vy + straightCost * (vx - vy));
                } else {
                    h = Math.floor(diagonalCost * vx + straightCost * (vy - vx));
                }
                return h;
            };

            //Loop through all the nodes until the current `centerNode` matches the
            //`destinationNode`. When they they're the same we know we've reached the
            //end of the path
            while (centerNode !== destinationNode) {

                //Find all the nodes surrounding the current `centerNode`
                var surroundingTestNodes = surroundingNodes(centerNode.index, mapArray, mapWidthInTiles, useDiagonalNodes);

                //Loop through all the `surroundingTestNodes` using a classic `for` loop
                //(A `for` loop gives us a marginal performance boost)

                var _loop = function _loop(i) {

                    //Get a reference to the current test node
                    var testNode = surroundingTestNodes[i];

                    //Find out whether the node is on a straight axis or
                    //a diagonal axis, and assign the appropriate cost

                    //A. Declare the cost variable
                    var cost = 0;

                    //B. Do they occupy the same row or column?
                    if (centerNode.row === testNode.row || centerNode.column === testNode.column) {

                        //If they do, assign a cost of "10"
                        cost = straightCost;
                    } else {

                        //Otherwise, assign a cost of "14"
                        cost = diagonalCost;
                    }

                    //C. Calculate the costs (g, h and f)
                    //The node's current cost
                    var g = centerNode.g + cost;

                    //The cost of travelling from this node to the
                    //destination node (the heuristic)
                    var h = undefined;
                    switch (heuristic) {
                        case "manhattan":
                            h = manhattan(testNode, destinationNode);
                            break;

                        case "euclidean":
                            h = euclidean(testNode, destinationNode);
                            break;

                        case "diagonal":
                            h = diagonal(testNode, destinationNode);
                            break;

                        default:
                            throw new Error("Oops! It looks like you misspelled the name of the heuristic");
                    }

                    //The final cost
                    var f = g + h;

                    //Find out if the testNode is in either
                    //the openList or closedList array
                    var isOnOpenList = openList.some(function (node) {
                        return testNode === node;
                    });
                    var isOnClosedList = closedList.some(function (node) {
                        return testNode === node;
                    });

                    //If it's on either of these lists, we can check
                    //whether this route is a lower-cost alternative
                    //to the previous cost calculation. The new G cost
                    //will make the difference to the final F cost
                    if (isOnOpenList || isOnClosedList) {
                        if (testNode.f > f) {
                            testNode.f = f;
                            testNode.g = g;
                            testNode.h = h;

                            //Only change the parent if the new cost is lower
                            testNode.parent = centerNode;
                        }
                    }

                    //Otherwise, add the testNode to the open list
                    else {
                        testNode.f = f;
                        testNode.g = g;
                        testNode.h = h;
                        testNode.parent = centerNode;
                        openList.push(testNode);
                    }

                    //The `for` loop ends here
                };

                for (var i = 0; i < surroundingTestNodes.length; i++) {
                    _loop(i);
                }

                //Push the current centerNode into the closed list
                closedList.push(centerNode);

                //Quit the loop if there's nothing on the open list.
                //This means that there is no path to the destination or the
                //destination is invalid, like a wall tile
                if (openList.length === 0) {

                    return theShortestPath;
                }

                //Sort the open list according to final cost
                openList = openList.sort(function (a, b) {
                    return a.f - b.f;
                });

                //Set the node with the lowest final cost as the new centerNode
                centerNode = openList.shift();

                //The `while` loop ends here
            }

            //Now that we have all the candidates, let's find the shortest path!
            if (openList.length !== 0) {

                //Start with the destination node
                var _testNode = destinationNode;
                theShortestPath.push(_testNode);

                //Work backwards through the node parents
                //until the start node is found
                while (_testNode !== startNode) {

                    //Step through the parents of each node,
                    //starting with the destination node and ending with the start node
                    _testNode = _testNode.parent;

                    //Add the node to the beginning of the array
                    theShortestPath.unshift(_testNode);

                    //...and then loop again to the next node's parent till you
                    //reach the end of the path
                }
            }

            //Return an array of nodes that link together to form
            //the shortest path
            return theShortestPath;
        }

        /*
        ### tileBasedLineOfSight
         Use the `tileBasedLineOfSight` function to find out whether two sprites
        are visible to each other inside a tile based maze environment.
         */

    }, {
        key: "tileBasedLineOfSight",
        value: function tileBasedLineOfSight(spriteOne, //The first sprite, with `centerX` and `centerY` properties
                                             spriteTwo, //The second sprite, with `centerX` and `centerY` properties
                                             mapArray, //The tile map array
                                             world) //An array of angles to which you want to
            //restrict the line of sight
        {
            var emptyGid = arguments.length <= 4 || arguments[4] === undefined ? 0 : arguments[4];

            var _this6 = this;

            var segment = arguments.length <= 5 || arguments[5] === undefined ? 32 : arguments[5];
            var angles = arguments.length <= 6 || arguments[6] === undefined ? [] : arguments[6];

            //Plot a vector between spriteTwo and spriteOne
            var vx = spriteTwo.centerX - spriteOne.centerX,
                vy = spriteTwo.centerY - spriteOne.centerY;

            //Find the vector's magnitude (its length in pixels)
            var magnitude = Math.sqrt(vx * vx + vy * vy);

            //How many points will we need to test?
            var numberOfPoints = magnitude / segment;

            //Create an array of x/y points that
            //extends from `spriteOne` to `spriteTwo`
            var points = function points() {

                //Initialize an array that is going to store all our points
                //along the vector
                var arrayOfPoints = [];

                //Create a point object for each segment of the vector and
                //store its x/y position as well as its index number on
                //the map array
                for (var i = 1; i <= numberOfPoints; i++) {

                    //Calculate the new magnitude for this iteration of the loop
                    var newMagnitude = segment * i;

                    //Find the unit vector
                    var dx = vx / magnitude,
                        dy = vy / magnitude;

                    //Use the unit vector and newMagnitude to figure out the x/y
                    //position of the next point in this loop iteration
                    var x = spriteOne.centerX + dx * newMagnitude,
                        y = spriteOne.centerY + dy * newMagnitude;

                    //The getIndex function converts x/y coordinates into
                    //map array index positon numbers
                    var getIndex = function getIndex(x, y, tilewidth, tileheight, mapWidthInTiles) {

                        //Convert pixel coordinates to map index coordinates
                        var index = {};
                        index.x = Math.floor(x / tilewidth);
                        index.y = Math.floor(y / tileheight);

                        //Return the index number
                        return index.x + index.y * mapWidthInTiles;
                    };

                    //Find the map index number that this x and y point corresponds to
                    var index = _this6.getIndex(x, y, world.tilewidth, world.tileheight, world.widthInTiles);

                    //Push the point into the `arrayOfPoints`
                    arrayOfPoints.push({
                        x: x, y: y, index: index
                    });
                }

                //Return the array
                return arrayOfPoints;
            };

            //The tile-based collision test.
            //The `noObstacles` function will return `true` if all the tile
            //index numbers along the vector are `0`, which means they contain
            //no walls. If any of them aren't 0, then the function returns
            //`false` which means there's a wall in the way
            var noObstacles = points().every(function (point) {
                return mapArray[point.index] === emptyGid;
            });

            //Restrict the line of sight to right angles only (we don't want to
            //use diagonals)
            var validAngle = function validAngle() {

                //Find the angle of the vector between the two sprites
                var angle = Math.atan2(vy, vx) * 180 / Math.PI;

                //If the angle matches one of the valid angles, return
                //`true`, otherwise return `false`
                if (angles.length !== 0) {
                    return angles.some(function (x) {
                        return x === angle;
                    });
                } else {
                    return true;
                }
            };

            //Return `true` if there are no obstacles and the line of sight
            //is at a 90 degree angle
            if (noObstacles === true && validAngle() === true) {
                return true;
            } else {
                return false;
            }
        }

        /*
        surroundingCrossCells
        ---------------------
         Returns an array of index numbers matching the cells that are orthogonally
        adjacent to the center `index` cell
         */

    }, {
        key: "surroundingCrossCells",
        value: function surroundingCrossCells(index, widthInTiles) {
            return [index - widthInTiles, index - 1, index + 1, index + widthInTiles];
        }

        /*
        surroundingDiagonalCells
        ---------------------
         Returns an array of index numbers matching the cells that touch the
        4 corners of the center the center `index` cell
         */

    }, {
        key: "surroundingDiagonalCells",
        value: function surroundingDiagonalCells(index, widthInTiles) {
            return [index - widthInTiles - 1, index - widthInTiles + 1, index + widthInTiles - 1, index + widthInTiles + 1];
        }

        /*
        validDirections
        ---------------
         Returns an array with the values "up", "down", "left" or "right"
        that represent all the valid directions in which a sprite can move
        The `validGid` is the grid index number for the "walkable" part of the world
        (such as, possibly, `0`.)
        */

    }, {
        key: "validDirections",
        value: function validDirections(sprite, mapArray, validGid, world) {

            //Get the sprite's current map index position number
            var index = g.getIndex(sprite.x, sprite.y, world.tilewidth, world.tileheight, world.widthInTiles);

            //An array containing the index numbers of tile cells
            //above, below and to the left and right of the sprite
            var surroundingCrossCells = function surroundingCrossCells(index, widthInTiles) {
                return [index - widthInTiles, index - 1, index + 1, index + widthInTiles];
            };

            //Get the index position numbers of the 4 cells to the top, right, left
            //and bottom of the sprite
            var surroundingIndexNumbers = surroundingCrossCells(index, world.widthInTiles);

            //Find all the tile gid numbers that match the surrounding index numbers
            var surroundingTileGids = surroundingIndexNumbers.map(function (index) {
                return mapArray[index];
            });

            //`directionList` is an array of 4 string values that can be either
            //"up", "left", "right", "down" or "none", depending on
            //whether there is a cell with a valid gid that matches that direction.
            var directionList = surroundingTileGids.map(function (gid, i) {

                //The possible directions
                var possibleDirections = ["up", "left", "right", "down"];

                //If the direction is valid, choose the matching string
                //identifier for that direction. Otherwise, return "none"
                if (gid === validGid) {
                    return possibleDirections[i];
                } else {
                    return "none";
                }
            });

            //We don't need "none" in the list of directions
            //(it's just a placeholder), so let's filter it out
            var filteredDirectionList = directionList.filter(function (direction) {
                return direction != "none";
            });

            //Return the filtered list of valid directions
            return filteredDirectionList;
        }

        /*
        canChangeDirection
        ------------------
         Returns `true` or `false` depending on whether a sprite in at a map
        array location in which it able to change its direction
        */

    }, {
        key: "canChangeDirection",
        value: function canChangeDirection() {
            var validDirections = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

            //Is the sprite in a dead-end (cul de sac.) This will be true if there's only
            //one element in the `validDirections` array
            var inCulDeSac = validDirections.length === 1;

            //Is the sprite trapped? This will be true if there are no elements in
            //the `validDirections` array
            var trapped = validDirections.length === 0;

            //Is the sprite in a passage? This will be `true` if the the sprite
            //is at a location that contain the values
            //???left??? or ???right??? and ???up??? or ???down???
            var up = validDirections.find(function (x) {
                    return x === "up";
                }),
                down = validDirections.find(function (x) {
                    return x === "down";
                }),
                left = validDirections.find(function (x) {
                    return x === "left";
                }),
                right = validDirections.find(function (x) {
                    return x === "right";
                }),
                atIntersection = (up || down) && (left || right);

            //Return `true` if the sprite can change direction or
            //`false` if it can't
            return trapped || atIntersection || inCulDeSac;
        }

        /*
        randomDirection
        ---------------
         Randomly returns the values "up", "down", "left" or "right" based on
        valid directions supplied. If the are no valid directions, it returns "trapped"

        */

    }, {
        key: "randomDirection",
        value: function randomDirection(sprite) {
            var validDirections = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

            //The `randomInt` helper function returns a random integer between a minimum
            //and maximum value
            var randomInt = function randomInt(min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            };

            //Is the sprite trapped?
            var trapped = validDirections.length === 0;

            //If the sprite isn't trapped, randomly choose one of the valid
            //directions. Otherwise, return the string "trapped"
            if (!trapped) {
                return validDirections[randomInt(0, validDirections.length - 1)];
            } else {
                return "trapped";
            }
        }

        /*
        closestDirection
        ----------------
         Tells you the closes direction to `spriteTwo` from `spriteOne` based on
        supplied validDirections. The function returns any of these
        4 values: "up", "down", "left" or "right"
         */

    }, {
        key: "closestDirection",
        value: function closestDirection(spriteOne, spriteTwo) {
            var validDirections = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

            //A helper function to find the closest direction
            var closest = function closest() {

                //Plot a vector between spriteTwo and spriteOne
                var vx = spriteTwo.centerX - spriteOne.centerX,
                    vy = spriteTwo.centerY - spriteOne.centerY;

                //If the distance is greater on the X axis...
                if (Math.abs(vx) >= Math.abs(vy)) {

                    //Try left and right
                    if (vx <= 0) {
                        return "left";
                    } else {
                        return "right";
                    }
                }

                //If the distance is greater on the Y axis...
                else {

                    //Try up and down
                    if (vy <= 0) {
                        return "up";
                    } else {
                        return "down";
                    }
                }
            };
        }
    }]);

    return TileUtilities;
})();
//# sourceMappingURL=tileUtilities.js.map