import { rollFromFormula } from "../helpers/actors/rollsFromActor.mjs";
import { DC20RPG } from "../helpers/config.mjs";
import { skillMasteryValue } from "../helpers/actors/skills.mjs";

/**
 * Dialog window for picking custom attribute for skill roll.
 */
export class VariableAttributePickerDialog extends Dialog {

  constructor(actor , parentDataset, dialogData = {}, options = {}) {
    super(dialogData, options);
    this.actor = actor;
    this.parentDataset = parentDataset;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: "systems/dc20rpg/templates/dialogs/variable-attribute-picker.hbs",
      classes: ["dc20rpg", "dialog"]
    });
  }

  getData() {
    return DC20RPG.attributes;
  }

   /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html.find('.rollable').click(ev => this._onRoll(ev));
  }

  _onRoll(event) {
    event.preventDefault();
    const selectedAttributeKey = $(".selectable option:selected").val();
    const selectedAttributeLabel = $(".selectable option:selected").text();
    const parentDataset = this.parentDataset;

    let value = skillMasteryValue(parentDataset.mastery);
    let rollFormula = `d20+ @attributes.${selectedAttributeKey}.check + ${parentDataset.bonus} + ${value}`;
    let label = parentDataset.label ? `${parentDataset.label} (${selectedAttributeLabel})` : '';
    
    this.close();
    rollFromFormula(rollFormula, label, this.actor, true);
  }
}

/**
 * Creates VariableAttributePickerDialog for given actor and with dataset extracted from event. 
 */
export function createVariableRollDialog(dataset, actor) {
  let dialog = new VariableAttributePickerDialog(actor, dataset, {title: "Variable Attribute Roll"});
  dialog.render(true);
}