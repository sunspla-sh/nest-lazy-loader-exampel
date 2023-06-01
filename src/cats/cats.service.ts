import { Injectable } from '@nestjs/common';

@Injectable()
export class CatsService {
  findAllCats(): Array<string> {
    return ['red cat', 'blue cat'];
  }
}
