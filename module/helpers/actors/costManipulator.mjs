import { arrayOfTruth } from "../utils.mjs";

//============================================
//              Item Usage Costs             =
//============================================
/**
 * Return item costs data formatted to be used in html files.
 */
export function getItemUsageCosts(item, actor) {
  if (!item.system.costs) return {};
  const usageCosts = {};
  usageCosts.resources = _getItemResources(item);
  usageCosts.otherItem = _getOtherItem(item, actor);
  return usageCosts;
}

function _getItemResources(item) {
  const resourcesCosts = item.system.costs.resources;

  let counter = 0;
  let costs = {
    actionPoint: {cost: resourcesCosts.actionPoint},
    stamina: {cost: resourcesCosts.stamina},
    mana: {cost: resourcesCosts.mana},
    health: {cost: resourcesCosts.health},
    custom: {}
  };
  counter += resourcesCosts.actionPoint || 0;
  counter += resourcesCosts.stamina || 0;
  counter += resourcesCosts.mana || 0;
  counter += resourcesCosts.health || 0;

  Object.entries(resourcesCosts.custom).forEach(([key, customCost]) => {
    counter += customCost.value || 0;
    costs.custom[key] = {
      img: customCost.img,
      name: customCost.name,
      value: customCost.value
    }
  });

  return {
    counter: counter,
    costs: costs
  };
}

function _getOtherItem(item, actor) {
  const otherItem = item.system.costs.otherItem;
  if(!actor) return {};

  const usedItem = actor.items.get(otherItem.itemId);
  if (!usedItem) return {};

  return {
    amount: otherItem.amountConsumed,
    consumeCharge: otherItem.consumeCharge,
    name: usedItem.name,
    image: usedItem.img,
  }
}

//============================================
//          Resources Manipulations          =
//============================================
export function subtractAP(actor, amount) {
  if (_canSubtractBasicResource("ap", actor, amount)) {
    subtractBasicResource("ap", actor, amount);
    return true;
  }
  return false;
}

export function refreshAllActionPoints(actor) {
  let max = actor.system.resources.ap.max;
  actor.update({["system.resources.ap.value"] : max});
}

export function subtractBasicResource(key, actor, amount, boundary) {
  amount = parseInt(amount);
  if (amount <= 0) return;

  const current = actor.system.resources[key].value;
  const newAmount = boundary === "true" ? Math.max(current - amount, 0) : current - amount;

  actor.update({[`system.resources.${key}.value`] : newAmount});
}

export function regainBasicResource(key, actor, amount, boundary) {
  amount = parseInt(amount);
  if (amount <= 0) return;

  const valueKey = key === "health" ? "current" : "value"
  const current = actor.system.resources[key][valueKey];
  const max = actor.system.resources[key].max;
  const newAmount = boundary === "true" ? Math.min(current + amount, max) : current + amount;

  actor.update({[`system.resources.${key}.${valueKey}`] : newAmount});
}

//===========================================
//        Item Charges Manipulations        =
//===========================================
export function changeCurrentCharges(value, item) {
  let changedValue = parseInt(value);
  let maxCharges = parseInt(item.system.costs.charges.max);
  if (isNaN(changedValue)) changedValue = 0;
  if (changedValue < 0) changedValue = 0;
  if (changedValue > maxCharges) changedValue = maxCharges;
  item.update({["system.costs.charges.current"] : changedValue});
}

//=============================================
//        Item Usage Costs Subtraction        =
//=============================================
/**
 * Checks if all resources used by item are available for actor. 
 * If so subtracts those from actor current resources.
 */
export function respectUsageCost(actor, item) {
  if (!item.system.costs) return true;
  let basicCosts = item.system.costs.resources;
  basicCosts = _costsAndEnhancements(actor, item);

  if(_canSubtractAllResources(actor, item, basicCosts) && _canSubtractFromOtherItem(actor, item)) {
    _subtractAllResources(actor, item, basicCosts);
    _subtractFromOtherItem(actor, item);
    return true;
  }
  return false;
}

function _costsAndEnhancements(actor, item) {
  let enhancements = item.system.enhancements;
  const usesWeapon = item.system.usesWeapon;
  if (usesWeapon?.weaponAttack) {
    const weapon = actor.items.get(usesWeapon.weaponId);
    if (weapon) {
      enhancements = {
        ...enhancements,
        ...weapon.system.enhancements
      }
    }
  }
  
  let costs = foundry.utils.deepClone(item.system.costs.resources);
  if (!enhancements) return costs;

  for (let enhancement of Object.values(enhancements)) {
    if (enhancement.number) {
      // Core Resources
      for (let [key, resource] of Object.entries(enhancement.resources)) {
        if (key !== 'custom') costs[key] += enhancement.number * resource;
      }

      // Custom Resources
      for (let [key, custom] of Object.entries(enhancement.resources.custom)) {
        costs.custom[key].value += enhancement.number * custom.value;
      }
    }
  }

  return costs;
}

function _canSubtractAllResources(actor, item, costs) {
  let canSubtractAllResources = [
    _canSubtractBasicResource("ap", actor, costs.actionPoint),
    _canSubtractBasicResource("stamina", actor, costs.stamina),
    _canSubtractBasicResource("mana", actor, costs.mana),
    _canSubtractBasicResource("health", actor, costs.health),
    _canSubtractCustomResources(actor, costs.custom),
    _canSubtractCharge(item, 1),
    _canSubtractQuantity(item, 1),
  ];
  return arrayOfTruth(canSubtractAllResources);
}

function _subtractAllResources(actor, item, costs) {
  const oldResources = actor.system.resources

  let newResources = _copyResources(oldResources);
  newResources = _prepareBasicResourceToSubtraction("ap", costs.actionPoint, newResources);
  newResources = _prepareBasicResourceToSubtraction("stamina", costs.stamina, newResources);
  newResources = _prepareBasicResourceToSubtraction("mana", costs.mana, newResources);
  newResources = _prepareBasicResourceToSubtraction("health", costs.health, newResources);
  newResources = _prepareCustomResourcesToSubtraction(costs.custom, newResources);
  _subtractActorResources(actor, newResources);
  _subtractCharge(item, 1);
  _subtractQuantity(item, 1);
}

function _subtractActorResources(actor, newResources) {
  actor.update({['system.resources'] : newResources});
}

function _copyResources(old) {
  const nev = {
    ap: {},
    stamina: {},
    mana: {},
    health: {},
    grit: {},
    custom: {}
  };

  // Standard Resources
  for (const [key, resource] of Object.entries(old)) {
    if(key === "custom") continue;
    if(key === "health") nev[key].current = resource.current;
    nev[key].value = resource.value;
  }

  // Custom Resources
  for (const [key, resource] of Object.entries(old.custom)) {
    if (!nev.custom[key]) nev.custom[key] = {}; // If no object with key found create new object
    nev.custom[key].value = resource.value;
  }
  
  return nev;
}

//================================
//        Basic Resources        =
//================================
function _canSubtractBasicResource(key, actor, cost) {
  if (cost <= 0) return true;

  const resources = actor.system.resources;
  const current = key === "health" ? resources[key].current : resources[key].value;
  const newAmount = current - cost;

  if (newAmount < 0) {
    let errorMessage = `Cannot subract ${cost} ${key} from ${actor.name}. Not enough ${key} (Current amount: ${current}).`;
    ui.notifications.error(errorMessage);
    return false;
  }
  
  return true;
}

function _prepareBasicResourceToSubtraction(key, cost, newResources) {
  if (cost <= 0) return newResources;

  if(key === "health") newResources[key].current -= cost;
  newResources[key].value -= cost;

  return newResources;
}

//=================================
//        Custom Resources        =
//=================================
function _canSubtractCustomResources(actor, customCosts) {
  const customResources = actor.system.resources.custom;

  for (const [key, cost] of Object.entries(customCosts)) {
    if (!customResources[key]) continue;
    if (cost.value <= 0) continue;

    const current = customResources[key].value;
    const newAmount = current - cost.value;
  
    if (newAmount < 0) {
      let errorMessage = `Cannot subract ${cost.value} charges of custom resource ${cost.name} from ${actor.name}. Current amount: ${current}.`;
      ui.notifications.error(errorMessage);
      return false;
    }
  }

  return true;
}

function _prepareCustomResourcesToSubtraction(customCosts, newResources) {
  const customResources = newResources.custom;

  for (const [key, cost] of Object.entries(customCosts)) {
    if (!customResources[key]) continue;
    if (cost.value <= 0) continue;

    const current = customResources[key].value;
    const newAmount = current - cost.value;

    newResources.custom[key].value = newAmount;
  }

  return newResources;
}

//===============================
//        Item Resources        =
//===============================
function _canSubtractFromOtherItem(actor, item) {
  const otherItemUsage = item.system.costs.otherItem;
  if (!otherItemUsage.itemId) return true;

  const otherItem = actor.items.get(otherItemUsage.itemId);
  if (!otherItem) {
    let errorMessage = `Item used by ${item.name} doesn't exist.`;
    ui.notifications.error(errorMessage);
    return false;
  }

  return otherItemUsage.consumeCharge 
    ? _canSubtractCharge(otherItem, otherItemUsage.amountConsumed) 
    : _canSubtractQuantity(otherItem, otherItemUsage.amountConsumed);
}

function _subtractFromOtherItem(actor, item) {
  const otherItemUsage = item.system.costs.otherItem;
  if (otherItemUsage.itemId) {
    const otherItem = actor.items.get(otherItemUsage.itemId);
    otherItemUsage.consumeCharge 
     ? _subtractCharge(otherItem, otherItemUsage.amountConsumed) 
     : _subtractQuantity(otherItem, otherItemUsage.amountConsumed);
  }
}

function _canSubtractCharge(item, subtractedAmount) {
  let max = item.system.costs.charges.max;
  if (!max) return true;

  let current = item.system.costs.charges.current;
  let newAmount = current - subtractedAmount;

  if (newAmount < 0) {
    let errorMessage = `Cannot use ${item.name}. No more charges.`;
    ui.notifications.error(errorMessage);
    return false;
  }
  return true;
}

function _subtractCharge(item, subtractedAmount) {
  let max = item.system.costs.charges.max;
  if (!max) return;

  let current = item.system.costs.charges.current;
  let newAmount = current - subtractedAmount;

  item.update({["system.costs.charges.current"] : newAmount});
}

function _canSubtractQuantity(item, subtractedAmount) {
  if (item.type !== "consumable") return true; // It is not consumable
  if (!item.system.consume) return true; // It doesn't consume item on use

  let current = item.system.quantity;
  let newAmount = current - subtractedAmount;

  if (current <= 0) {
    let errorMessage = `Cannot use ${item.name}. No more items.`;
    ui.notifications.error(errorMessage);
    return false;
  }

  if (newAmount < 0) {
    let errorMessage = `Cannot use ${item.name}. No enough items.`;
    ui.notifications.error(errorMessage);
    return false;
  }

  return true;
}

function _subtractQuantity(item, subtractedAmount) {
  if (item.type !== "consumable") return;
  if (!item.system.consume) return;

  let deleteOnZero = item.system.deleteOnZero;
  let current = item.system.quantity;
  let newAmount = current - subtractedAmount;

  if (newAmount === 0 && deleteOnZero) {
    item.delete();
  } 
  else {
    item.update({["system.quantity"] : newAmount});
  }
}