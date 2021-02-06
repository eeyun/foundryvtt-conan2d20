export default function registerHandlebarsHelpers() {
  Handlebars.registerHelper('add', (a: number, b: number) => {
    return a + b;
  });

  Handlebars.registerHelper('multiply', (a: number, b: number) => {
    return a * b;
  });

  Handlebars.registerHelper('lower', (str: string) => {
    return String.prototype.toLocaleLowerCase.call(str ?? '');
  });

  Handlebars.registerHelper('if_all', function () {
    /* eslint-disable-next-line prefer-rest-params */
    const args = [].slice.apply(arguments);
    const opts = args.pop();

    let {fn} = opts;
    for (let i = 0; i < args.length; i += 1) {
      /* eslint-disable-next-line no-continue */
      if (args[i]) continue;
      fn = opts.inverse;
      break;
    }
    return fn(this);
  });

  Handlebars.registerHelper(
    'ifEq',
    function (arg1: any, arg2: any, options: any) {
      return arg1 === arg2 ? options.fn(this) : options.inverse(this);
    }
  );

  Handlebars.registerHelper(
    'ifCond',
    function (v1: any, operator: any, v2: any, options: any) {
      switch (operator) {
        case '==':
          return v1 === v2 ? options.fn(this) : options.inverse(this);
        case '===':
          return v1 === v2 ? options.fn(this) : options.inverse(this);
        case '!=':
          return v1 !== v2 ? options.fn(this) : options.inverse(this);
        case '!==':
          return v1 !== v2 ? options.fn(this) : options.inverse(this);
        case '<':
          return v1 < v2 ? options.fn(this) : options.inverse(this);
        case '<=':
          return v1 <= v2 ? options.fn(this) : options.inverse(this);
        case '>':
          return v1 > v2 ? options.fn(this) : options.inverse(this);
        case '>=':
          return v1 >= v2 ? options.fn(this) : options.inverse(this);
        case '&&':
          return v1 && v2 ? options.fn(this) : options.inverse(this);
        case '||':
          return v1 || v2 ? options.fn(this) : options.inverse(this);
        default:
          return options.inverse(this);
      }
    }
  );
}
