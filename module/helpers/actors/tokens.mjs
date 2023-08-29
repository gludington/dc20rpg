import { DC20RPG } from "../config.mjs";
import { getLabelFromKey } from "../utils.mjs";
import { rollFromFormula } from "./rollsFromActor.mjs";

export async function getSelectedTokens() {
  if (canvas.activeLayer === canvas.tokens)
      return canvas.activeLayer.placeables.filter(p => p.controlled === true);
}

/**
 * Calls rollFromFormula for selected tokens.
 */
export async function rollForTokens(event, type) {
  event.preventDefault();
  const dataset = event.currentTarget.dataset;
  const selectedTokens = await getSelectedTokens();
  if (selectedTokens.length === 0) return;

  selectedTokens.forEach(async (token) => {
    const actor = await token.actor;
    if (type === "save") _rollSave(actor, dataset);
    if (type === "check") _rollSkill(actor, dataset);
  })
}

function _rollSave(actor, dataset) {
  let attribute = actor.system.attributes[dataset.save];
  let modifier = attribute.save;

  let label = getLabelFromKey(dataset.save, DC20RPG.saveTypes) + " Save";
  const formula = `d20 + ${modifier}`;
  rollFromFormula(formula, label, actor, true);
}

function _rollSkill(actor, dataset) {
  let modifier = "";
  let label = "";
  if (dataset.key === "mar") {
    let acr = actor.system.skills.acr;
    let ath = actor.system.skills.ath;
    
    let isAcrHigher =  acr.modifier > ath.modifier;
    modifier = isAcrHigher ? acr.modifier : ath.modifier;

    let labelKey = isAcrHigher ? "acr" : "ath";
    label += "Martial (" + getLabelFromKey(labelKey, DC20RPG.skills) + ")";
  } else {
    let skill = actor.system.skills[dataset.key]
    modifier = skill.modifier;
    label += getLabelFromKey(dataset.key, DC20RPG.skills);
  }
  label += " Check";
  const formula = `d20 + ${modifier}`;
  rollFromFormula(formula, label, actor, true);
}