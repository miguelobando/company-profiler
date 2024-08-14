import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { isURL } from 'class-validator';

// AI-GENERATED

@Injectable()
export class ParseUrlPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    const decodedValue = decodeURIComponent(value);
    if (!isURL(decodedValue)) {
      throw new BadRequestException('Invalid URL');
    }
    return decodedValue;
  }
}
