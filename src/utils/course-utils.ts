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
  
  /**
   * Añade un cero delante de números menores que 10
   */
  static padZero(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  /**
   * Formatea una fecha para mostrarla en formato dd-mm
   */
  static formatDate(date: Date): string {
    return `${CourseUtils.padZero(date.getDate())}-${CourseUtils.padZero(date.getMonth() + 1)}`;
  }

  /**
   * Obtiene el nombre del día de la semana en español
   */
  static getDayName(date: Date): string {
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return dayNames[date.getDay()];
  }

  /**
   * Formatea una hora desde un string en formato HH:MM:SS a HH:MM
   */
  static formatTime(time: string): string {
    return time.substring(0, 5);
  }
}
