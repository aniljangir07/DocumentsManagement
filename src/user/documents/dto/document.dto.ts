import { IsString, IsInt, IsOptional } from 'class-validator';

export class CreateDocumentDto {
      @IsString()
      title: string;

      @IsInt()
      pageSize: number;

      @IsOptional()
      @IsString()
      status: string;
}

export class EditDocumentDto {
      @IsOptional()
      @IsString()
      title: string;

      @IsOptional()
      @IsInt()
      pageSize: number;

      @IsOptional()
      @IsString()
      status: string

}

export class UpdateStatusDocumentDto {
      documentId: string;
      status: string;
}
