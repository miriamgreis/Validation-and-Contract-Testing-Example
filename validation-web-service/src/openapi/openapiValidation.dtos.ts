import { ISpectralDiagnostic } from '@stoplight/spectral-core';
import { ApiProperty } from '@nestjs/swagger';
import { DiagnosticSeverity } from '@stoplight/types';

export class OpenApiValidationFindingDTO implements ISpectralDiagnostic {
  constructor(diagnostics: ISpectralDiagnostic) {
    this.code = diagnostics.code;
    this.message = diagnostics.message;
    this.path = diagnostics.path;
    this.range = diagnostics.range;
    this.severity = diagnostics.severity;
  }

  @ApiProperty({
    description: 'Spectral or custom code.',
    type: 'string | number',
    example: 'oas3-unused-component',
  })
  readonly code: string | number;
  @ApiProperty({ example: 'Potentially unused component has been detected.' })
  readonly message: string;
  @ApiProperty({
    type: 'Array<string | number>',
    isArray: true,
    example: ['paths', '/pet/{petId}', 'get', 'responses', '200', '$ref'],
  })
  readonly path: Array<string | number>;
  @ApiProperty({
    description: 'Range in the OpenAPI file, which causes the finding.',
    type:
      '{ start: { line: number; character: number }\n' +
      'end: { line: number; character: number } }',
    example:
      '{"start": {"line": 33,"character": 16},"end": {"line": 33,"character": 62}}',
  })
  readonly range: {
    start: { line: number; character: number };
    end: { line: number; character: number };
  };
  @ApiProperty({ enum: DiagnosticSeverity })
  severity: any;
}
