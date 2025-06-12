import { BlockType, BlockTypeInSpanish } from '../modules/blocks/enums/block-type.enum';

export class CourseUtils {
  /**
   * Devuelve el nombre en español del tipo de bloque
   */
  static blockTypeName(blockType: BlockType): string {
    switch (blockType) {
      case BlockType.THEORY:
        return BlockTypeInSpanish.THEORY;
      default:
        return BlockTypeInSpanish.PRACTICE;
    }
  }

  /**
   * Extrae el nombre del archivo de una URL
   */
  static extractFileNameFromUrl(url: string): string {
    if (!url) return '';

    try {
      const urlWithoutParams = url.split('?')[0];
      const segments = urlWithoutParams.split('/');
      const fileName = segments[segments.length - 1];
      return decodeURIComponent(fileName);
    } catch (error) {
      return '';
    }
  }
}
