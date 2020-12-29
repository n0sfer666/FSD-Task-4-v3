class Pointer {
  readonly $container: JQuery;

  readonly normalizingCoefficient: number = 1e4;

  $document: JQuery.PlainObject;

  orientation: tOrientation;

  position: number;

  index: number;

  $element: JQuery;

  callbackList: iPointerCallback[] = [];

  shift: number = 0;

  boundingClientRect: number = 0;

  containerOffsetSize: number = 0;

  className: string = 'simple-range-slider__pointer';

  constructor($container: JQuery, orientation: tOrientation, position: number, index: number) {
    this.$container = $container;
    this.$document = $(document);
    this.orientation = orientation;
    this.position = position;
    this.index = index;
    this.$element = this.getElement();
    this.setPosition(this.position);
    this.bindContext();
    this.bindHandler();
  }

  getElement(): JQuery {
    const $element: JQuery = jQuery(document.createElement('div'));
    $element.addClass(`${this.className}`);
    $element.addClass(`${this.className}_${this.orientation}`);
    return $element;
  }

  switchActive(isActive: boolean) {
    if (isActive) {
      this.$element.addClass(`${this.className}_active`);
    } else {
      this.$element.removeClass(`${this.className}_active`);
    }
  }

  subscribeOn(callback: iPointerCallback) {
    this.callbackList.push(callback);
  }

  setPosition(position: number) {
    const liter: string = this.orientation === 'horizontal' ? 'X' : 'Y';
    this.$element.css('transform', `translate${liter}(${position}%)`);
    this.position = position;
  }

  getShift(event: MouseEvent): number {
    return this.orientation === 'horizontal'
      ? event.clientX - this.$element.position().left
      : event.clientY - this.$element.position().top;
  }

  handlePointerMouseDown(event: MouseEvent) {
    event.preventDefault();
    this.shift = this.getShift(event);
    this.boundingClientRect = this.orientation === 'horizontal'
      ? this.$container.position().left
      : this.$container.position().top;
    this.containerOffsetSize = this.orientation === 'horizontal'
      ? this.$container[0].offsetWidth
      : this.$container[0].offsetHeight;
    this.$document.on('mousemove', this.handlePointerMove);
    this.$document.on('mouseup', this.handlePointerMouseUp);
  }

  handlePointerMove(event: MouseEvent) {
    const cursorPosition: number = this.orientation === 'horizontal'
      ? event.clientX
      : event.clientY;
    const newPosition: number = cursorPosition - this.shift - this.boundingClientRect;
    const newPositionInPercent: number = newPosition / this.containerOffsetSize;
    if (newPositionInPercent > 1) {
      this.position = 1 * this.normalizingCoefficient;
    } else if (newPositionInPercent < 0) {
      this.position = 0;
    } else {
      this.position = Math.round(newPositionInPercent * this.normalizingCoefficient);
    }
    this.callbackList.forEach((callback) => callback({
      index: this.index,
      position: this.position,
    }));
  }

  handlePointerMouseUp() {
    this.$document.off('mousemove', this.handlePointerMove);
    this.$document.off('mouseup', this.handlePointerMouseUp);
  }

  bindContext() {
    this.handlePointerMouseDown = this.handlePointerMouseDown.bind(this);
    this.handlePointerMouseUp = this.handlePointerMouseUp.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
  }

  bindHandler() {
    $.each(this.$element, (_, element) => {
      element.addEventListener('mousedown', this.handlePointerMouseDown);
    });
    // this.$element.on('mousedown', this.handlePointerMouseDown);
  }
}

export default Pointer;
