export default function registerHandlebarsHelpers() {
    Handlebars.registerHelper('add', function(a: number, b: number) {
        return a + b;
    });

    Handlebars.registerHelper('multiply', function(a: number, b:number) {
        return a * b;
    });

    Handlebars.registerHelper('lower', function(str: string) {
        return String.prototype.toLocaleLowerCase.call(str ?? '');
    });

    Handlebars.registerHelper('if_all', function () {
        const args = [].slice.apply(arguments);
        const opts = args.pop();

        let { fn } = opts;
        for (let i = 0; i < args.length; ++i) {
            if (args[i]) continue;
            fn = opts.inverse;
            break;
        }
        return fn(this);
    });
}
