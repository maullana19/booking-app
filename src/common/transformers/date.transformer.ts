import { ValueTransformer } from 'typeorm';

export class DateTransformer implements ValueTransformer {
  // Change the data before save/send to Database
  to(value: Date | string | null | undefined): string | null {
    if (!value) return null;

    // If have string format YYYY-MM-DD
    if (typeof value === 'string') {
      const match = value.match(/^\d{4}-\d{2}-\d{2}/);
      if (match) return match[0];
      value = new Date(value);
    }

    // If instance Date JS
    if (value instanceof Date && !isNaN(value.getTime())) {
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    return null;
  }

  // Changin data after reading out database
  from(value: string | Date | null | undefined): string | null {
    if (!value) return null;

    if (value instanceof Date) {
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    // Return 'YYYY-MM-DD'
    return value;
  }
}
