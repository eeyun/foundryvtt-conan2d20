export default class CONANTokenHUD extends TokenHUD {


    activateListeners(html)
    {

        html.find(".status-effects")
        //@ts-ignore
        .off("click", ".effect-control", this._onToggleEffect.bind(this))
        //@ts-ignore
        .off("contextmenu", ".effect-control", event => this._onToggleEffect(event, {overlay: true}));

    }
}