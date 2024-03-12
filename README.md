## TODO:

|    STATUS    |   				TASK                    |
|--------------|----------------------------------|
|	   DONE	     |	BIG REWORK WHEN ALL RULLES ARE KNOWN	|
|	   DONE	     |	Free item roll when holding Alt			|
|	   DONE	  	 |	Initative and Combat					  |
|	   DONE	     |	Rest UI and system					    |
|      DONE      |	Resistances	and DR						  |
|      DONE      |	Technique and Spell Enhancements UI and config	|
|	   DONE	     |	Buttons on chat message for adding/removing hp from tokens also make crits green and crit fails red	|
|	   DONE	     |	Add Conditions with effects	    |
|	   DONE	     |	Refresh Action Points on turn end during combat	also add Turn Refresh and Combat Refresh  |
|	   DONE	     |	Refresh Items on turn/combat end  |
|	   DONE	     |	Target token to better calculate damage  |
|	   DONE	     |	Class/Ancestry/Subclass rework and advancement system  |
|	   DONE	     |	Mark item as reaction  |
|	 NOT DONE	 |	If Conditions for effects and effects update (add effect to token from chat message?)|
|	   DONE	     |	Modifications for core rolls (bless, etc)  |
|	   DONE	     |	Clickable Help dice on character sheet  |
|	   DONE	     |	Custom languages like custom knowledge skills |
|	   DONE	     |	Improvements for Advancements |
|	   DONE	     |  Classes can add custom resources (Arcane Points, Ki, etc)    |
|    NOT DONE    |  Half damage on miss (example of Ice Knife spell) (also maybe things like impact, great weapon fighting etc?)    |
|	   DONE	     |  Initiative toggle button    |
|	   DONE	     |  Advantages/Disadvantages for rolls form formulas (skill check, saves, etc)    |
|	   DONE	     |  Non attuned/equipped items provide no effects    |
|	   DONE	     |	Ancestries advancement shown at lvl 0 |
|	   DONE	     |	Save/Check buttons on chat message will provide result in save/checks with success or fail status |
||
|	   IDEA	     |	Item Resources usable like Custom Resources by items?	|
|	   IDEA	     |	Active Effects keys as selectable dropdown 	|
|	   IDEA	     |	Buttons to roll Mental/Physical saves and Martial Check?	|
|	   DONE	     |	Additional info about different actions in game (help, attack, itp) (as popup with buttons?)	|
|	   IDEA	     |	Change adding unique items to actors from hooks to Actor.prepareEmbeddedDocuments method	|
|	   IDEA	     |	Tooltips for what properties do	|
|	   IDEA	     |	Target focused damage callculations	|
||
|	 DO LATER	 |	Character Sheet design			|
|	 DO LATER	 |	Favorites action tab? Item tables redesign			|
|	 DO LATER    |	Redesign of NPC Sheet	    |
|	 DO LATER	 |	Encumbrance and Money					  |
|	 DO LATER	 |	Overall code refactor					  |
|	   DONE	     |	Subclass and Ancestry Items			|
|	 DO LATER	 |	Change token size depending on actor size |
|	 DO LATER	 |	Loot actor or some other way to prepare loot in advance |

## Changelog

##  Bug fixes
- Fixed an issue causing Advancement window to apper for all active players when any player added a Class/Ancestry/Subclass.
- Fixed an issue causing editor to not appear on Journal Page and on Journal Tap on Actor Sheet.
- Fixed an issue causing some actor updates to make values provided by ActiveEffects permanent.
- Added script to fix 0.5.1 bugged data.

## Changes
- Switched text editor from TinyMCE to ProseMirror.
- Attribute Overhaul.
- Ancestries now have level 0 traits instead of level 1.
- Non attuned/equipped items provide no effects now.
- Rolling Save or Check from chat message will not prompt if check/save was successful or not.
- Added Grit Points.
- Added backgrounds and Skill Points.
- Changes to the way damage/healing is being applied from chat message to selected tokens.
- Targeting tokens before rolling an item will now enhance roll message with informations about attack miss/hit/heavy/brutal.
- Character becomes blodied/well bloodied/dead and enters Death's Door on specific hp thresholds.
- Added condition immunities.
- 0.6 Ruling Update.
- Added Beastborn Ancestry.
- Updated compendiums with 0.6 changes.