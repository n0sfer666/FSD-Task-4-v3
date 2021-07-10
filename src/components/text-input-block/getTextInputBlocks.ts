import '../../SimpleRangeSlider/SimpleRangeSliderJQ';
import TextInput from './text-input-block';

function getTextInputBlocks(
  $mainContainer: JQuery,
  $sliderContainer: JQuery,
  sliderConfig: CompleteConfigList,
  isSinglePointer: boolean,
): TextInput[] {
  return Array.from($mainContainer.find('.js-text-input-block')
    .not('.text-input-block_with-control')
    .map((_, element) => new TextInput(
      $(element),
      $sliderContainer,
      sliderConfig,
      isSinglePointer,
    )));
}

export default getTextInputBlocks;
