class Model {
  readonly normalizingCoefficient: number = 1e4;

  callbackList: iModelCallback[] = [];

  positions: number[];

  readonly range: tRange;

  values: number[];

  step: number;

  isSinglePointer: boolean

  activePointerIndex: number = 0;

  constructor(config: iConfigModel) {
    const { range, start, step } = config;
    this.values = start;
    this.range = range;
    this.step = step;
    this.isSinglePointer = start.length === 1;
    this.positions = this.values.map((val) => this.getPositionFromValue(val));
  }

  subscribeOn(callback: iModelCallback) {
    this.callbackList.push(callback);
  }

  getPositionFromValue(value: number): number {
    const result: number = (value - this.range[0]) / (this.range[1] - this.range[0]);
    return Math.round(result * this.normalizingCoefficient) / this.normalizingCoefficient;
  }

  getValueFromPosition(position: number): number {
    const result: number = (position * (this.range[1] - this.range[0])) + this.range[0];
    return Math.round(result);
  }

  getNewValue(viewData: tViewData): number {
    const { index, position, value } = viewData;
    if (position !== undefined) {
      if (position <= 0) {
        return this.range[0];
      }
      if (position >= 1) {
        return this.range[1];
      }
    }
    if (value !== undefined) {
      if (value <= this.range[0]) {
        return this.range[0];
      }
      if (value >= this.range[1]) {
        return this.range[1];
      }
    }
    const newValue: number = value || this.getValueFromPosition(position || 0);
    const rightBoundary = this.values[1] - this.step;
    const leftBoundary = this.values[0] + this.step;
    const isValueOfLeftPointerBiggerThanRight = newValue > rightBoundary;
    const isValueOfRightPointerSmallerThanLeft = newValue < leftBoundary;
    if (index === 0 && !this.isSinglePointer) {
      return isValueOfLeftPointerBiggerThanRight ? rightBoundary : newValue;
    }
    if (index === 1) {
      return isValueOfRightPointerSmallerThanLeft ? leftBoundary : newValue;
    }
    return newValue;
  }

  setValueAndPosition(newValue: number, index: number) {
    const leftBoundary = this.values[index] - (this.step / 2);
    const rightBoundary = this.values[index] + (this.step / 2);
    const isOutOfRange = newValue < this.range[0] || newValue > this.range[1];
    const isOutOfBoundary = newValue >= rightBoundary || newValue <= leftBoundary;
    const resultValue = Math.round(newValue / this.step) * this.step;

    if (!isOutOfRange && isOutOfBoundary) {
      this.values[index] = resultValue;
      this.positions[index] = this.getPositionFromValue(resultValue);
    }
  }

  updateByView(viewData: tViewData) {
    const { index } = viewData;
    this.activePointerIndex = index;
    const newValue = this.getNewValue(viewData);
    this.setValueAndPosition(newValue, index);
    this.callbackList.forEach(
      (viewCallback: iModelCallback) => viewCallback({
        positions: this.positions,
        values: this.values,
        index,
      }),
    );
  }
}

export default Model;
