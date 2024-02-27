import {
  BadRequestException,
  Controller,
  FileTypeValidator,
  HttpCode,
  Logger,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { OpenApiValidationFindingDTO } from './openapi/openapiValidation.dtos';

@Controller('v1/openapi')
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(private readonly appService: AppService) {}

  @ApiOperation({
    tags: ['OpenAPI'],
    description:
      'Validate a OpenAPI specification against the OpenAPI Schema and custom rules.',
    summary: 'Validate one OpenAPI specification',
    operationId: 'validateOpenApiSpecification',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: `The OpenAPI file to upload. <br>
Only one file per request is possible.<br>
Supported file type: yaml or yml.`,
    required: true,
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        ['file']: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOkResponse({
    description:
      'The OpenAPI specification was successfully uploaded and no finding has the error severity level.',
    type: OpenApiValidationFindingDTO,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description:
      'Multiple reasons: <ul>' +
      '<li>Attempted upload of more than one file.</li>' +
      '<li>File is not a .yaml or .yml file.</li>' +
      '<li>No file provided in body.</li>' +
      '<li>File does not comply with OpenAPI schema or custom rules.</li></ul>',
  })
  @HttpCode(200)
  @Post('validate')
  @UseInterceptors(FileInterceptor('file'))
  async validate(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 100000 }),
          new FileTypeValidator({ fileType: /.(yaml|yml)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<OpenApiValidationFindingDTO[]> {
    this.logger.log(`validate OpenAPI ${file.originalname}`);
    const validationResults = await this.appService.validateOpenAPI(file);
    if (validationResults.hasErrors()) {
      throw new BadRequestException(validationResults.DTO);
    }
    return validationResults.DTO;
  }

  @ApiOperation({
    tags: ['OpenAPI'],
    description:
      'Validate a OpenAPI specification against the OpenAPI Schema and custom rules and publish to some catalog.',
    summary: 'Validate one OpenAPI specification and publish to API catalog.',
    operationId: 'publishOpenApiSpecification',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: `The OpenAPI file to upload. <br>
Only one file per request is possible.<br>
Supported file type: yaml or yml.`,
    required: true,
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        ['file']: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description:
      'The OpenAPI specification was successfully uploaded and no finding has the error severity level.',
  })
  @ApiBadRequestResponse({
    description:
      'Multiple reasons: <ul>' +
      '<li>Attempted upload of more than one file.</li>' +
      '<li>File is not a .yaml or .yml file.</li>' +
      '<li>No file provided in body.</li>' +
      '<li>File does not comply with OpenAPI schema or custom rules.</li></ul>',
    type: OpenApiValidationFindingDTO,
    isArray: true,
  })
  @Post('publish')
  @UseInterceptors(FileInterceptor('file'))
  async publish(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 100000 }),
          new FileTypeValidator({ fileType: /.(yaml|yml)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<string> {
    this.logger.log(`validate OpenAPI ${file.originalname}`);
    const validationResults = await this.appService.validateOpenAPI(file);
    if (validationResults.hasErrors()) {
      throw new BadRequestException(validationResults.DTO);
    }
    this.logger.log(`publish OpenAPI ${file.originalname}`);
    return this.appService.publishToCatalog(file);
  }
}
