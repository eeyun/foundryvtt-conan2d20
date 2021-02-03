export default function() {
  // @ts-ignore
  TokenHUD.prototype._onToggleEffect = function(event, {overlay=false}={}) {
    event.preventDefault();
    let img = event.currentTarget;
    const effect = ( img.dataset.statusId && this.object.actor ) ?
      // @ts-ignore
      CONFIG.statusEffects.find(e => e.id === img.dataset.statusId) :
      img.getAttribute("src");
    if (event.button == 0)
      return this.object.incrementCondition(effect)
    if (event.button == 2)
      return this.object.decrementCondition(effect)
  }

  // @ts-ignore
  Token.prototype.incrementCondition = async function(effect, {active, overlay=false}={}) {
    const existing = this.actor.effects.find(e => e.getFlag("core", "statusId") === effect.id);
    // @ts-ignore
    if (!existing || Number.isNumeric(getProperty(existing, "data.flags.conan2d20.value")))
      this.actor.addCondition(effect.id)
    else if (existing) // Not numeric, toggle if existing
      this.actor.removeCondition(effect.id)

    // Update the Token HUD
    if ( this.hasActiveHUD ) canvas.tokens.hud.refreshStatusIcons();
    return active;
  }

  // @ts-ignore
  Token.prototype.decrementCondition = async function(effect, {active, overlay=false}={}) {
    this.actor.removeCondition(effect.id)
  
    // Update the Token HUD
    if ( this.hasActiveHUD ) canvas.tokens.hud.refreshStatusIcons();
    return active;
  }
}