/**
 * Formatea una fecha con la zona horaria especificada
 * @param date Fecha a formatear
 * @param timezone Zona horaria (ej. 'America/Lima')
 * @returns Fecha formateada como 'DD-MM-YYYY_HH-MM'
 */
export function formatDateWithTimezone(date: Date, timezone: string = 'UTC'): string {
  try {
    // Verificar que el timezone sea válido o usar UTC como fallback
    let validTimezone = timezone;
    try {
      // Intenta crear un formateador con el timezone proporcionado para validarlo
      Intl.DateTimeFormat('es-ES', { timeZone: timezone });
    } catch (e) {
      console.warn(`Timezone inválido: ${timezone}, usando UTC`);
      validTimezone = 'UTC';
    }
    
    // Formatear usando partes para mayor control
    const formatter = new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: validTimezone
    });
    
    // Obtener partes individuales del formato
    const parts = formatter.formatToParts(date);
    
    // Extraer componentes específicos
    const year = parts.find(part => part.type === 'year')?.value || '';
    const month = parts.find(part => part.type === 'month')?.value || '';
    const day = parts.find(part => part.type === 'day')?.value || '';
    const hour = parts.find(part => part.type === 'hour')?.value || '';
    const minute = parts.find(part => part.type === 'minute')?.value || '';
    
    // Crear el formato personalizado: DD-MM-YYYY_HH-MM
    return `${day}-${month}-${year}_${hour}-${minute}`;
  } catch (error) {
    // Si hay un error, usar formato simple con UTC
    console.error('Error formateando fecha con timezone:', timezone, error);
    const pad = (num: number): string => num.toString().padStart(2, '0');
    const utcDate = new Date(date.toUTCString());
    
    return `${pad(utcDate.getUTCDate())}-${pad(utcDate.getUTCMonth() + 1)}-${utcDate.getUTCFullYear()}_${pad(utcDate.getUTCHours())}-${pad(utcDate.getUTCMinutes())}`;
  }
}
