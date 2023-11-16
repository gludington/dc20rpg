import { rollActionFormula } from "../helpers/actors/rollsFromActor.mjs";
import { datasetOf } from "../helpers/events.mjs";

/**
 * Dialog window for using standard actions.
 */
export class ActionsDialog extends Dialog {

  constructor(actor, dialogData = {}, options = {}) {
    super(dialogData, options);
    this.actor = actor;
    this.actions = {
      ...this._getOffensiveActions(),
      ...this._getDefensiveActions(),
      ...this._getUtilityActions(),
      ...this._getSkillBasedActions()
    }
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: "systems/dc20rpg/templates/dialogs/actions-dialog.hbs",
      classes: ["dc20rpg", "dialog"],
      width: 650,
      height: 550,
      tabs: [{ navSelector: ".dialog-tabs", contentSelector: ".dialog-body", initial: "offensive" }]
    });
  }

  getData() {
    return {
      offensive: this._getOffensiveActions(),
      defensive: this._getDefensiveActions(),
      utility: this._getUtilityActions(),
      skill: this._getSkillBasedActions()
    };
  }

   /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html.find(".roll-action").click(ev => this._rollActionForKey(datasetOf(ev)));
  }

  _rollActionForKey(dataset) {
    const key = dataset.key;
    const formulaKey = dataset.formulaKey
    const action = this.actions[key];
    const selectedFormula = action.formulas[formulaKey];
    const flatAction = {
      description: action.description,
      name: action.name,
      formula: selectedFormula.formula,
      label: selectedFormula.label,
      apCost: selectedFormula.apCost
    }
    rollActionFormula(flatAction, this.actor);
  }

  _getOffensiveActions() {
    return {
      attack: this._attack(),
      disarm: this._disarm(),
      grapple: this._grapple(),
      shove: this._shove(),
      tackle: this._tackle()
    }
  }

  _getDefensiveActions() {
    return {
      disengage: this._disengage(),
      dodge: this._dodge(),
      hide: this._hide()
    }
  }

  _getUtilityActions() {
    return {
      move: this._move(),
      help: this._help(),
      object: this._object()
    }
  }

  _getSkillBasedActions(){
    return {
      passThrough: this._passThrough(),
      analyzeCreature: this._analyzeCreature(),
      calmAnimal: this._calmAnimal(),
      combatInsight: this._combatInsight(),
      conceal: this._conceal(),
      feint: this._feint(),
      intimidate: this._intimidate(),
      investigate: this._investigate(),
      jump: this._jump(),
      mountedDefence: this._mountedDefence(),
      medicine: this._medicine(),
      search: this._search()
    }
  }

  //==================================
  //            OFFENSIVE            =
  //==================================
  _attack() {
    const description = "You can spend <b>1 AP</b> to make 1 <b>Attack Check</b>.";
    return {
      description: description,
      formulas: {
        attack: {
          label: "Attack Check",
          formula: "d20+@attackMod.value.martial",
          apCost: 1
        }
      },
      name: "Attack Action"
    }
  }
  _disarm() {
    const description = "You can spend <b>1 AP</b> to make an <b>Attack Check</b> Contested by " + 
    "the target's <b>Athletics</b>, <b>Acrobatics</b>, or <b>Trickery Check</b> (targets choice), " +
    "the target has ADV if they are holding the object with 2 hands, you have DisADV if the target " + 
    "is larger than you. You cannot Disarm a creature that is 2 Sizes larger than you." +
    "<br><br><b>Success:</b> The targeted object falls into an unoccupied space of your" + 
    "choice within 1 Spaces of the creature.";
    return {
      description: description,
      formulas: {
        disarm: {
          label: "Disarm (Attack Check)",
          formula: "d20+@attackMod.value.martial",
          apCost: 1
        }
      },
      name: "Disarm Action"
    }
  }
  _grapple() {
    const description = "Using a free hand, you can spend <b>1 AP</b> to attempt to <b>Grapple</b> " + 
    "another creature. Make an <b>Athletics Check</b> contested by the opposing creature's " + 
    "<b>Martial Check</b>. <br><b>Success:</b> The creature is <b>Grappled</b> by you." +
    "<br><br><b>Escape Grapple:</b> You can spend <b>1 AP</b> to attempt to free yourself from a <b>Grapple</b>. " + 
    "Make a <b>Martial Check</b> contested by the opposing creatures <b>Athletics Check</b>. " + 
    "<br><b>Success:</b> You end the <b>Grappled</b> Condition on yourself.";
    return {
      description: description,
      formulas: {
        grapple: {
          label: "Grapple (Athletics Check)",
          formula: "d20+@skills.ath.modifier",
          apCost: 1
        }
      },
      name: "Grapple Action"
    }
  }
  _shove() {
    const description = "You can spend <b>1 AP</b> to attempt to push a creature within 1 Space of you. " + 
    "Make an <b>Athletics Check</b> contested by the target's <b>Martial Check.</b> " + 
    "<br><b>Success:</b> You push the creature 1 Space away from you or to its left or right. " + 
    "<br><b>Success (each 5):</b> Push up to 1 additional Space." +
    "<br><br><b>Knock Prone:</b> After the result, you can choose to reduce the total distance " + 
    "the target is pushed by 1 Space to knock them <b>Prone</b> instead.";
    return {
      description: description,
      formulas: {
        shove: {
          formulaKey: "shove",
          label: "Shove (Athletics Check)",
          formula: "d20+@skills.ath.modifier",
          apCost: 1
        }
      },
      name: "Shove Action"
    }
  }
  _tackle() {
    const description = "If you move at least 2 Spaces in a straight line, you can spend <b>1 AP</b> " + 
    "to attempt to Tackle a creature that is your same size or smaller. " + 
    "Make an <b>Athletics Check</b> contested by the target's <b>Martial Check.</b> " + 
    "<br><br><b>Success:</b> You <b>Grapple</b> the target, you both move 1 Space in the same direction" + 
    "you're moving, and immediately fall <b>Prone</b>." + 
    "<br><b>Success (each 5):</b> +1 Space moved.";
    return {
      description: description,
      formulas: {
        tackle: {
          label: "Tackle (Athletics Check)",
          formula: "d20+@skills.ath.modifier",
          apCost: 1
        }
      },
      name: "Tackle Action"
    }
  }

  //==================================
  //            DEFENSIVE            =
  //==================================
  _disengage() {
    const description = "You can spend <b>1 AP</b> to impose DisADV on <b>Opportunity Attacks</b> made " + 
    "against you until the start of your next turn." + 
    "<br><br><b>Full Disengage:</b> When you take the <b>Disengage Action</b>, you can spend an additional " + 
    "<b>1 AP</b> to become immune to <b>Opportunity Attacks</b> until the start of your next turn.";
    return {
      description: description,
      formulas: {
        disengage: {
          label: "Disengage",
          apCost: 1
        },
        full: {
          label: "Full Disengage",
          apCost: 2
        }
      },
      name: "Disengage Action"
    }
  }
  _dodge() {
    const description = "You can spend <b>1 AP</b> to impose DisADV on on the next <b>Attack Check</b> " + 
    "or <b>Spell Check</b> made against you until the start of your next turn." + 
    "<br><br><b>Full Dodge:</b> When you take the <b>Dodge Action</b>, you can spend an additional " + 
    "<b>1 AP</b> to impose DisADV on all <b>Attacks</b> made against you until the start of your next turn.";
    return {
      description: description,
      formulas: {
        disengage: {
          label: "Dodge",
          apCost: 1
        },
        full: {
          label: "Full Dodge",
          apCost: 2
        }
      },
      name: "Dodge Action"
    }
  }
  _hide() {
    const description = "You can spend <b>1 AP</b> to attempt to <b>Hide</b> from 1 or more creatures that can't see " +
    "you (<b>Unseen</b>). Make a <b>Stealth Check</b> against the opposing creatures <b>Passive Awareness</b>. " + 
    "<br><b>Success:</b> You become <b>Unheard</b> by creatures whose <b>Passive Awareness</b> you beat, making you <b>Hidden</b> " +
    "from them. You remain <b>Hidden</b> until you make a noise louder than a whisper, make an <b>Attack</b>, " +
    "cast a <b>Spell</b> with a <b>Verbal Component</b>, or a creature takes the <b>Search Action</b> and successfully " +
    "locates you. <ul>" + 
    "<li><b>Unheard:</b> You are Unheard while you remain silent, talk no louder than a whisper, or are within an area affected by the Silence Spell." +
    "<li><b>Unseen:</b> You are Unseen by a creature while you are imperceivable to its visual senses, such as when you are outside its <b>Line of Sight</b> " + 
    "(behind <b>Full Cover</b>), it's <b>Blinded</b>, or you are obscured from it such as by being <b>Invisible</b>." +
    "<li><b>Hidden:</b> While you are both <b>Unheard</b> and <b>Unseen</b>, you are considered <b>Hidden</b>, and your location or presence unknown to other creatures." +
    "</ul><br>When you can see a target that can't see you, you have ADV on <b>Attack Checks</b> against them (see “Unseen Attackers” for more info).";
    return {
      description: description,
      formulas: {
        hide: {
          label: "Hide (Stealth Check)",
          formula: "d20+@skills.ste.modifier",
          apCost: 1
        }
      },
      name: "Hide Action"
    }
  }

  //==================================
  //             UTILITY             =
  //==================================
  _move() {
    const description = "You can spend <b>1 AP</b> to move up to your Speed in Spaces (default of 4). " +
    "It chooses where to move, and can break up its movement by moving before and after taking " +
    "a different <b>Action</b>. You can't end your turn in a Space occupied by another creature.";
    return {
      description: description,
      formulas: {
        move: {
          label: "Move",
          apCost: 1
        },
      },
      name: "Move Action"
    }
  }
  _help() {
    const description = "You can spend <b>1 AP</b> to grant a creature a <b>Help Die</b>, which is a <b>d8</b>, " +
    "that lasts until the start of your next turn. Upon granting the <b>Help Die</b>, you must declare the type" +
    "of Check to aid and meet the following conditions: <ul>" +
    "<li> <b>Attack or Spell Check:</b> You declare 1 attacker and 1 target. You must be within 1 Space of" + 
    "the attacker or the target in order to grant the <b>Help Die</b>. While the <b>Help Die</b> lasts, the " + 
    "attacker can add the <b>Help Die</b> to 1 <b>Attack Check</b> or <b>Spell Check</b> it makes against the target PD." +
    "<li> <b>Skill or Trade Check:</b> You declare which type of Skill or Trade you are helping the creature with and " +
    "then describe how you do so using a Skill or Trade that you have at least 1 Mastery Level in. You can use the same " +
    "Skill or Trade or a different one. </ul>" + 
    "<br>The <b>Help Die</b> can only be used to aid the type of Check declared." +
    "<br><br><b>Multiple Help Penalty:</b> Once you take the Help Action, each time you take the " + 
    "Help Action again before the end of your turn, your <b>Help Die</b> decreases by 1 step, to a minimum of a d4 " +
    "(d8 | d6 | d4).";
    return {
      description: description,
      formulas: {
        help: {
          label: "Help",
          apCost: 1
        },
      },
      name: "Help Action"
    }
  }
  _object() {
    const description = "You can spend <b>1 AP</b> to perform 1 of the following object interactions: <br><ul>" +
    "<li> Drink a Potion or Administer a Potion to another Creature." +
    "<li> Attempt to Lock or Unlock a Lock." +
    "<li> Make a <b>Trickery Check</b> to activate or disable a trap or other mechanism." +
    "<li> Transfer and Item to or from another Creature (only 1 of the two creatures spends <b>1 AP</b>)." +
    "<li> Throw an Item to location you can see up to 5 Spaces away." +
    "</ul>";
    return {
      description: description,
      formulas: {
        object: {
          label: "Object",
          apCost: 1
        },
      },
      name: "Object Action"
    }
  }

  //==================================
  //           SKILL BASED           =
  //==================================
  _passThrough() {
    const description = "You can spend <b>1 AP</b> to attempt to move through a Space occupied by a hostile " +
    "creature that's within 1 size of you. Make a contested <b>Martial Check</b> against the target." +
    "<br><br><b>Success:</b> You can move through the creature's Space as if it were <b>Difficult Terrain</b>" + 
    "(<b>Slowed 1</b> while moving through the area).";
    return {
      description: description,
      formulas: {
        passThrough: {
          label: "Pass Through (Martial Check)",
          formula: "d20+max(@skills.acr.modifier, @skills.ath.modifier)",
          apCost: 1
        }
      },
      name: "Pass Through"
    }
  }
  _analyzeCreature() {
    const description = "You can spend <b>1 AP</b> to attempt to recall or discern some information " +
    "about a creature that you can see or hear. Make a <b>DC 10 Knowledge Check</b> determined by the GM." +
    "<br><br><b>Success:</b> You learn a piece of lore about the creature." + 
    "<br><b>Success(5):</b> You learn 1 creature statistic (PD, MD, Attacks, Abilities, Resistances, Vulnerabilities, Immunities, etc.)." +
    "<br><b>Success(10):</b> +1 creature statistic."
    return {
      description: description,
      formulas: {
        arcana: {
          label: "Arcana",
          formula: "d20+@skills.arc.modifier",
          apCost: 1
        },
        history: {
          label: "History",
          formula: "d20+@skills.his.modifier",
          apCost: 1
        },
        nature: {
          label: "Nature",
          formula: "d20+@skills.nat.modifier",
          apCost: 1
        },
        occultism: {
          label: "Occultism",
          formula: "d20+@skills.occ.modifier",
          apCost: 1
        },
        religion: {
          label: "Religion",
          formula: "d20+@skills.rel.modifier",
          apCost: 1
        },
      },
      name: "Analyze Creature"
    }
  }
  _calmAnimal() {
    const description = "You can spend <b>1 AP</b> to attempt to beguile a Beast that can see or hear you. " +
    + "Make an <b>Animal Check</b> contested by the target's <b>Charisma Save</b>." +
    "<br><br><b>Success:</b> The animal is <b>Taunted</b> by you for 1 minute (Repeated Save) or until you target it with a harmful <b>Attack</b>, <b>Spell</b>, or other effect." + 
    "<br><b>Success(5):</b> It's also <b>Impaired</b>." +
    "<br><b>Success(10):</b> It's also <b>Charmed</b>."
    return {
      description: description,
      formulas: {
        calmAnimal: {
          label: "Calm Animal (Animal Check)",
          formula: "d20+@skills.ani.modifier",
          apCost: 1
        }
      },
      name: "Calm Animal"
    }
  }
  _combatInsight() {
    const description = "You can spend <b>1 AP</b> to attempt to discern the course of actions a creature might " + 
    "take on its next turn. Make an <b>Insight Check</b> contested by the target's <b>Trickery</b> or <b>Influence Check</b> (its choice)." +
    "<br><br><b>Success:</b> You learn the target's emotional state and whether it plans to make an <b>Attack</b>, cast a <b>Spell</b>, or flee combat during its next turn." + 
    "<br><b>Success(5):</b> You know who the creature is likely to target with a harmful ability." +
    "<br><b>Success(10):</b> You know which ability the creature plans to use."
    return {
      description: description,
      formulas: {
        combatInsight: {
          label: "Combat Insight (Insight Check)",
          formula: "d20+@skills.ins.modifier",
          apCost: 1
        }
      },
      name: "Combat Insight"
    }
  }
  _conceal() {
    const description = "You can spend <b>1 AP</b> to hide an object on yourself or in nearby foliage, debris, or decor to render it <b>Hidden</b>. " + 
    "Make a contested <b>Trickery Check</b> against the <b>Passive Awareness</b> of creatures that can see you." +
    "<br><br><b>Success:</b> The object is <b>Hidden</b> from any creature whose <b>Passive Awareness</b> you beat.";
    return {
      description: description,
      formulas: {
        conceal: {
          label: "Conceal (Trickery Check)",
          formula: "d20+@skills.tri.modifier",
          apCost: 1
        }
      },
      name: "Conceal"
    }
  }
  _feint() {
    const description = "You can spend <b>1 AP</b> to make <b>Trickery Check</b> contested by the target's <b>Insight Check</b>." +
    "<br><br><b>Success:</b> The next <b>Attack</b> against the target before the start of your next turn has ADV and deals +1 damage.";
    return {
      description: description,
      formulas: {
        feint: {
          label: "Feint (Trickery Check)",
          formula: "d20+@skills.tri.modifier",
          apCost: 1
        }
      },
      name: "Feint"
    }
  }
  _intimidate() {
    const description = "You can spend <b>1 AP</b> to attempt to intimidate a creature that can see or hear you." + 
    "Make a contested <b>Intimidation Check</b> contested by the target's <b>Charisma Save</b>." +
    "<br><br><b>Success:</b> The target is <b>Intimidated</b> by you until the end of your next turn.";
    return {
      description: description,
      formulas: {
        intimidate: {
          label: "Intimidate (Intimidation Check)",
          formula: "d20+@skills.inm.modifier",
          apCost: 1
        }
      },
      name: "Intimidate"
    }
  }
  _investigate() {
    const description = "You can spend <b>1 AP</b> to attempt to uncover a concealed object on a creature, a " +
    "secret compartment, or the intended function of a mechanism within 1 Space of you. <ul>" + 
    "<li><b>Concealed Objects:</b> You can attempt to uncover any objects concealed on a creature. Make an <b>Investigation Check</b> contested by the target's <b>Trickery Check</b>. " +
    "<br><b>Success:</b> You know the location of any concealed object on the creature." +
    "<li><b>Secret Compartments:</b> You can attempt to uncover any secret compartments. Make an <b>Investigation Check</b> against the <b>discovery DC</b> of any secret compartments. " +
    "<br><b>Success:</b> You discover the location of any secret compartments whose <b>discovery DC</b> you beat." +
    "<li><b>Discern Mechanism:</b> You can attempt to discern the functionality of a mechanism (the effect of a trap, how to open a secret door, or activate a device). " +
    "Make an <b>Investigation Check</b>. " +
    "<br><b>Success:</b> You learn how the mechanism works and the methods to activate and disable it (if any)." +
    "</ul>";
    return {
      description: description,
      formulas: {
        investigate: {
          label: "Investigate (Investigation Check)",
          formula: "d20+@skills.inv.modifier",
          apCost: 1
        }
      },
      name: "Investigate"
    }
  }
  _jump() {
    const description = "You can spend <b>1 AP</b> to attempt to increase the distance you can cover when Jumping. Make a <b>DC 10 Athletics Check</b>. <ul>" + 
    "<li><b>Long Jump Success:</b> You can move 1 additional Space as part of your Long Jump. <br><b>Success(each 5):</b> +1 additional Space." +
    "<li><b>High Jump Success:</b> : You can move an additional 1ft (30cm) as part of your High Jump. <br><b>Success(each 5):</b> +1ft (30cm)." +
    "</ul>";
    return {
      description: description,
      formulas: {
        jump: {
          label: "Jump (Athletics Check)",
          formula: "d20+@skills.ath.modifier",
          apCost: 1
        }
      },
      name: "Jump"
    }
  }
  _mountedDefence() {
    const description = "You can spend <b>1 AP</b> to maneuver a mount you are riding to avoid danger. Make a <b>DC 10 Animal Check</b>." +
    "<br><br><b>Success:</b> The mount's PD increases by 2 until the start of your next turn." + 
    "<br><b>Success(5):</b> +2 PD." +
    "<br><b>Success(10):</b> +4 MD."
    return {
      description: description,
      formulas: {
        mountedDefence: {
          label: "Mounted Defence (Animal Check)",
          formula: "d20+@skills.ani.modifier",
          apCost: 1
        }
      },
      name: "Mounted Defence"
    }
  }
  _medicine() {
    const description = "You can spend <b>1 AP</b> to maneuver a mount you are riding to avoid danger. Make a <b>DC 10 Animal Check</b>." +
    "<br><br><b>Success:</b> The mount's PD increases by 2 until the start of your next turn." + 
    "<br><b>Success(5):</b> You stop its <b>Bleeding</b> or <b>Stabilize</b> it (your choice)." +
    "<br><b>Success(each 5):</b> The creature gains +1 Temp HP."
    return {
      description: description,
      formulas: {
        medicine: {
          label: "Medicine (Animal Check)",
          formula: "d20+@skills.med.modifier",
          apCost: 1
        }
      },
      name: "Medicine"
    }
  }
  _search() {
    const description = "You can spend <b>1 AP</b> to attempt to locate 1 or more <b>Hidden</b> creatures and concealed objects within your Line of Sight. <ul>" +
    "<li><b>Hidden Creatures:</b> You attempt to locate any <b>Hidden</b> creatures in the area. Make an <b>Awareness Check</b> against the <b>Stealth Check</b> of any Hidden creatures." +
    "<br><b>Success:</b> You know the location of any <b>Hidden</b> creature whose <b>Stealth Check</b> you beat until the end of your turn. " + 
    "<li><b>Hidden Objects:</b> You attempt to locate any <b>Hidden</b> objects in the area. Make an <b>Awareness Check</b> against the DC to discover any concealed objects (such as traps, secret doors, or hidden items)." +
    "<br><b>Success:</b> You discover the location of any <b>Hidden</b> object whose discovery DC you beat. " + 
    "</ul>"
    return {
      description: description,
      formulas: {
        search: {
          label: "Search (Awareness Check)",
          formula: "d20+@skills.awa.modifier",
          apCost: 1
        }
      },
      name: "Search"
    }
  }
}

/**
 * Creates ActionsDialog for given actor. 
 */
export function createActionsDialog(actor) {
  let dialog = new ActionsDialog(actor, {title: "Actions"});
  dialog.render(true);
}