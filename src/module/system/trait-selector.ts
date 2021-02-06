/**
 * THIS MODULE IS TAKEN AND MODIFIED FROM THE D&D5E SYSTEM
 * Original code resides here: https://gitlab.com/foundrynet/dnd5e/-/blob/master/module/apps/trait-selector.js
/**
 * A specialized form used to select damage or condition types which apply to an Actor
 * @type {FormApplication}
 */
export default class TraitSelector extends FormApplication {
  searchString: any;

  _filterTimeout: any;

  constructor(object, options) {
    super(object, options);

    // Internal flags
    this.searchString = null;

    /**
     * A filtering timeout function reference used to rate limit string filtering operations
     * @type {number|null}
     */
    this._filterTimeout = null;
  }

  static get defaultOptions() {
    const options = super.defaultOptions;
    options.id = 'trait-selector';
    options.classes = ['conan2d20'];
    options.title = 'Actor Trait Selection';
    options.template = 'systems/conan2d20/templates/actors/trait-selector.html';
    options.width = 'auto';
    options.height = 700;
    options.scrollY = ['.trait-list'];
    return options;
  }

  /* -------------------------------------------- */
  /**
   * Return a reference to the target attribute
   * @type {String}
   */
  get attribute() {
    return this.options.name;
  }

  /* -------------------------------------------- */
  /**
   * Provide data to the HTML template for rendering
   * @type {Object}
   */
  getData() {
    // Get current values
    console.log(this.object.data);
    console.log(this.attribute);
    const attr = getProperty(this.object.data, this.attribute);
    console.log(attr);
    if (typeof attr.value === 'string')
      attr.value = TraitSelector._backCompat(attr.value, this.options.choices);
    if (!attr.value) attr.value = '';
    const {hasValues} = this.options;
    const {hasExceptions} = this.options;
    const choices = duplicate(this.options.choices);
    console.log(choices);

    // Populate choices
    if (hasValues) {
      const selected = [];
      for (const [_k, trait] of Object.entries(attr as Record<any, any>)) {
        selected[trait.type] = {
          value: trait.value,
          exceptions: trait.exceptions,
        };
      }
      for (const [k, v] of Object.entries(choices)) {
        if (k in selected) {
          choices[k] = {
            label: v,
            chosen: true,
            value: selected[k].value || '',
            exceptions: selected[k].exceptions || '',
          };
        } else {
          choices[k] = {
            label: v,
            chosen: false,
          };
        }
      }
    } else {
      for (const [k, v] of Object.entries(choices)) {
        choices[k] = {
          label: v,
          chosen: attr.value.includes(k),
        };
      }
    }

    const orderedChoices = {};
    Object.keys(choices)
      .sort((a, b) => {
        return choices[a].label.localeCompare(choices[b].label);
      })
      .forEach(key => {
        orderedChoices[key] = choices[key];
      });
    console.log(orderedChoices);
    console.log(this.searchString);
    // Return data
    return {
      orderedChoices,
      hasValues,
      hasExceptions,
      searchString: this.searchString,
      custom: attr.custom,
    };
  }

  /**
   * Filter the potential traits to only show ones which match a provided search string
   * @param {string} searchString    The search string to match
   */
  search(searchString) {
    const query = new RegExp((RegExp as any).escape(searchString), 'i');
    (this.element as JQuery).find('li.trait-item').each((i, li) => {
      const name = li.getElementsByClassName('trait-label')[0].textContent;
      li.style.display = query.test(name) ? 'flex' : 'none';
    });
    this.searchString = searchString;
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Search filtering
    html.find('input[name="search"]').keyup(this._onFilterResults.bind(this));
    if (this.searchString) {
      this.search(this.searchString);
    }

    if (this.options.hasValues) {
      html.find('input[id^=input_value]').focusin(ev => {
        const {name} = ev.currentTarget;
        html.find(`input[type=checkbox][name="${name}"]`).prop('checked', true);
      });
      if (!this.options.allow_empty_values) {
        html.find('input[id^=input_value]').focusout(ev => {
          const input = ev.currentTarget;
          if (input.value === '')
            html
              .find(`input[type=checkbox][name="${input.name}"]`)
              .prop('checked', false);
        });
      }
    }

    if (this.options.hasExceptions) {
      html.find('input[id^=input_exception]').focusin(ev => {
        const {name} = ev.currentTarget;
        html.find(`input[type=checkbox][name="${name}]"`).prop('checked', true);
      });
      html.find('input[id^=input_exception]').focusout(ev => {
        const inputException = ev.currentTarget;
        const inputValue = html
          .find(`input[id=input_value][name="${inputException.name}"]`)
          .val();
        if (inputValue === '')
          html
            .find(`input[type=checkbox][name="${inputException.name}"]`)
            .prop('checked', false);
      });
    }
  }

  /**
   * Handle trait filtering through search field
   * Toggle the visibility of indexed trait entries by name match
   * @private
   */
  _onFilterResults(event) {
    event.preventDefault();
    const input = event.currentTarget;
    if (this._filterTimeout) {
      clearTimeout(this._filterTimeout);
      this._filterTimeout = null;
    }
    this._filterTimeout = setTimeout(() => this.search(input.value), 100);
  }

  /* -------------------------------------------- */

  /**
   * Support backwards compatibility for old-style string separated traits
   * @private
   */
  static _backCompat(current, choices) {
    if (!current || current.length === 0) return [];
    current = current.split(/[\s,]/).filter(t => !!t);
    return current
      .map(val => {
        for (const [k, v] of Object.entries(choices)) {
          if (val === v) return k;
        }
        return null;
      })
      .filter(val => !!val);
  }

  /* -------------------------------------------- */

  /**
   * Update the Actor object with new trait data processed from the form
   * @private
   */
  async _updateObject(event: Event, formData: any) {
    const choices = [];
    if (this.options.hasValues) {
      for (const [k, v] of Object.entries(formData as Record<any, any>)) {
        if (v.length > 1 && v[0]) {
          if (
            (!Number.isNaN(v[1]) && v[1] !== '') ||
            this.options.allow_empty_values
          ) {
            const label = this.options.choices[k];
            const exceptions = v[2] || '';
            choices.push({type: k, label, value: v[1], exceptions});
          }
        }
      }
      this.object.update({[`${this.attribute}`]: choices});
    } else {
      for (const [k, v] of Object.entries(formData)) {
        if (k !== 'search' && v) choices.push(k);
      }
      this.object.update({
        [`${this.attribute}.value`]: choices,
        [`${this.attribute}.custom`]: formData.custom,
      });
    }
  }
}
