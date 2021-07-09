class Scale {
  readonly valuePipsNumber: number = 5;

  readonly emptyPipsNumber: number = 3;

  $element: JQuery;

  range: ConfigRange;

  orientation: ConfigOrientation;

  $emptyPips: JQuery[] = [];

  $valuePips: JQuery[] = [];

  callbackList: ScaleCallback[] = [];

  diapason: number;

  values: number[] = [];

  positions: number[] = [];

  constructor(range: ConfigRange, orientation: ConfigOrientation) {
    this.bindContext();
    this.orientation = orientation;
    this.range = range;
    this.diapason = this.range[1] - this.range[0];
    this.values = this.getValues();
    this.positions = this.getPositions();
    this.$element = Scale.getElement('scale', this.orientation);
    this.$emptyPips = this.getEmptyPips();
    this.$valuePips = this.getValuePips();
    this.drawPips();
    this.bindHandler();
  }

  static getElement(elementName: string, modifier?: string): JQuery {
    const $element: JQuery = jQuery(document.createElement('div'));
    $element.addClass(`simple-range-slider__${elementName}`);
    if (modifier) {
      $element.addClass(`simple-range-slider__${elementName}_${modifier}`);
    }
    return $element;
  }

  getEmptyPips(): JQuery[] {
    const $emptyPips: JQuery[] = [];
    for (let i = 0; i < this.emptyPipsNumber; i += 1) {
      const $emptyDash = Scale.getElement('scale-pip-dash', 'empty');
      $emptyPips.push(Scale.getElement('scale-pip').append($emptyDash));
    }
    return $emptyPips;
  }

  getValuePips(): JQuery[] {
    const $valuePips: JQuery[] = this.values.map((value) => {
      const $dash = Scale.getElement('scale-pip-dash');
      const $pipValue = Scale.getElement('scale-pip-value').text(value);
      if (this.orientation === 'vertical') {
        return Scale.getElement('scale-pip').append($pipValue, $dash);
      }
      return Scale.getElement('scale-pip').append($dash, $pipValue);
    });

    return $valuePips;
  }

  drawPips() {
    this.$valuePips.forEach(($valueDashPip, index) => {
      this.$element.append($valueDashPip);
      const isLast: boolean = this.$valuePips.length - 1 === index;
      if (!isLast) {
        this.$emptyPips.forEach(($emptyDashPip) => {
          this.$element.append($emptyDashPip.clone());
        });
      }
    });
  }

  getValues(): number[] {
    const result: number[] = [this.range[0]];
    const difference: number = Math.round(this.diapason / (this.valuePipsNumber - 1));
    for (let i = 0; result.length < (this.valuePipsNumber - 1); i += 1) {
      result.push(result[i] + difference);
    }
    result.push(this.range[1]);
    return result;
  }

  getPositions(): number[] {
    const result: number[] = [0];
    const difference: number = 1 / (this.valuePipsNumber - 1);
    for (let i = 0; result.length < (this.valuePipsNumber - 1); i += 1) {
      result.push(result[i] + difference);
    }
    result.push(1);
    return result;
  }

  handlerValuePipClick(event: JQuery.MouseEventBase) {
    const targetValue: number = Number($(event.target).text());
    this.values.forEach((value, index) => {
      if (value === targetValue) {
        const position = this.positions[index];
        this.callbackList.forEach((callback) => {
          callback({ position });
        });
      }
    });
  }

  subscribeOn(callback: ScaleCallback) {
    this.callbackList.push(callback);
  }

  bindContext() {
    this.handlerValuePipClick = this.handlerValuePipClick.bind(this);
  }

  bindHandler() {
    this.$valuePips.forEach(($valueDashPip) => {
      $valueDashPip.on('click', this.handlerValuePipClick);
    });
  }
}

export default Scale;
