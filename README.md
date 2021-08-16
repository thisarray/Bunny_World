# Bunny_World
A bit of nostalgia for CS108 alumni.

Bunny World is the most famous puzzle in the final project for [CS108](https://web.stanford.edu/class/archive/cs/cs108/cs108.1092/oldSite.shtml).

The final project is both a runner and an editor for a simple graphical adventure game.
The game is really a generic graphical world populated with pictures and sounds.
The top rectangular area with a white background is called a page and can contain a number of Shape objects.
Only one page and its contents are visible at a time.
Certain actions within the game allow you to move from one page to another.
There is a special "page1" page where the game starts out when first run.
Just below the page is a separate "inventory" area that enables the player to carry Shape objects from one page to another.
(The original description calls it a "possessions" area but I changed it to "inventory" because that is standard terminology.)

You can find more details in the [handout](https://web.stanford.edu/class/archive/cs/cs108/cs108.1092/handouts081/36BunnyWorld.pdf).

## Deviations from the original

- Adventures are specified in JSON instead of XML.

- Only the runner part is implemented with the goal of making the Bunny World adventure playable.
  It is generally faster to edit the JSON in a text editor than to go through a special editor.

## License

Images and sounds can be found [here](https://web.stanford.edu/class/archive/cs/cs108/cs108.1092/hw/bunny-resources/).
I converted the .au sound files to .wav sound files.

The [Honor Code](https://communitystandards.stanford.edu/policies-and-guidance/honor-code) is permissive as long as you attribute the source.

## The solution path

**spoiler alert**

Take the leftmost door to visit the Mystic Bunny.
Rub the tummy not, you shall!
Visiting the Mystic Bunny causes door2 to appear.
Go back to the beginning and follow door2.
Drag the carrot to the inventory.
Go back past the Mystic Bunny (not rubbing his tummy) to the start.
Now you can face the Bunny of Death (note the huge fangs).
Drag the carrot to the Bunny of Death.
The Bunny of Death vanishes, the exit door appears, and you can go to the end page. Yay!

**spoiler alert**

> Haven't we all been tempted by our personal Mystic Bunny?
> Must we not each face a Bunny of Death?
