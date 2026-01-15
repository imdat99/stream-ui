// import { ApiProperty } from '@nestjs/swagger';

export class Response<T> {
    // @ApiProperty()
    statusCode: number = 200;

    // @ApiProperty()
    message: string = 'Success';

    // @ApiProperty()
    data: T = {} as T;
}
