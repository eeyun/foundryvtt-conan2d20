/**
 * Counter Application for 2d20 metacurrencies
 * @type {FormApplication}
 */
export default class Counter extends Application {
  
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = 'counter';
        options.classes = ['conan2d20'];
        options.template = 'systems/conan2d20/templates/apps/counter.html';
        options.width = "auto";
        options.height = 300;
        options.popOut = false;
        return options;
    }

    /* -------------------------------------------- */
    /**
     * Provide data to the HTML template for rendering
     * @type {Object}
     */
    getData() {
        let data = super.getData();
        data.momentum = game.settings.get("conan2d20", "momentum")
        data.doom = game.settings.get("conan2d20", "doom")
        data.canEdit = game.user.isGM || game.settings.get("conan2d20", "playerCounterEdit");

        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        // Call setCounter when input is used
        html.find("input").change(ev => {
            let type = $(ev.currentTarget).parents(".counter").attr("data-type")
            Counter.setCounter(ev.target.value, type);
        })

        // Call changeCounter when +/- is used
        html.find(".incr,.decr").click(ev => {
            let type = $(ev.currentTarget).parents(".counter").attr("data-type")
            let multiplier = $(ev.currentTarget).hasClass("incr") ? 1 : -1
            Counter.changeCounter(1 * multiplier, type);
        })
    }


    // ************************* STATIC FUNCTIONS ***************************

    /**
     * Set the counter of (type) to (value)
     * @param value Value to set counter to
     * @param type  Type of counter, "momentum" or "doom"
     */
    static async setCounter(value, type)
    {
        Counter.checkCounterUpdate(value, type);
        value = Math.round(value)
        
        if (!game.user.isGM)
        {
            // @ts-ignore
            game.socket.emit("system.conan2d20", 
            {
                type : "setCounter",
                payload: {value, type}
            })
            return
        }

        await game.settings.set("conan2d20", type, value)
        CONFIG.CONAN.Counter.render(true);

        // Emit socket event for users to rerender their counters
        // @ts-ignore
        game.socket.emit("system.conan2d20", {type : "updateCounter"})
    }

    /**
     * Change the counter of (type) by (value)
     * @param diff How much to change the counter
     * @param type  Type of counter, "momentum" or "doom"
     */
    static async changeCounter(diff, type)
    {
        Counter.checkCounterUpdate(diff, type);
        let value = game.settings.get("conan2d20", type)
        value += diff;
        Counter.setCounter(value, type);
    }

    // Check user entry. Rerender if error is detected to reset to the correct value
    static checkCounterUpdate(value, type)
    {
        if (type != "doom" && type !="momentum")
        {
            ui.notifications.error("Error updating Counter: Invalid Counter Type")
            CONFIG.CONAN.Counter.render(true);
            throw "Error updating Counter: Invalid Counter Type"
        }

        if (isNaN(value))
        {
            ui.notifications.error("Error updating Counter: Invalid Value Type")
            CONFIG.CONAN.Counter.render(true);
            throw "Error updating Counter: Invalid Value Type"
        }
    }
   
  }
  