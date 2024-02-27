import { Injectable } from '@nestjs/common';
import * as path from 'path';
import {
  Spectral,
  Document,
  ISpectralDiagnostic,
} from '@stoplight/spectral-core';
import * as Parsers from '@stoplight/spectral-parsers';
// @ts-ignore
import { bundleAndLoadRuleset } from '@stoplight/spectral-ruleset-bundler/with-loader';
import * as fs from 'fs';
import { OpenApiValidationFindingDTO } from './openapi/openapiValidation.dtos';
import { DiagnosticSeverity } from '@stoplight/types';

@Injectable()
export class AppService {
  async validateOpenAPI(
    file: Express.Multer.File,
  ): Promise<OpenapiValidationResult> {
    const fileContent = file.buffer.toString('utf8');

    const validator = await this.initSpectral();

    const document = new Document(fileContent, Parsers.Yaml);
    const diagnostics = await validator.run(document, {
      ignoreUnknownFormat: false,
    });

    return new OpenapiValidationResult(diagnostics);
  }

  async publishToCatalog(file: Express.Multer.File): Promise<string> {
    return `OpenAPI document: ${file.filename} published to API catalog`;
  }

  async initSpectral() {
    const validator = new Spectral();
    const rulesetFilepath = path.join(
      __dirname,
      'openapi',
      'custom-ruleset.yaml',
    );
    const ruleset = await bundleAndLoadRuleset(rulesetFilepath, { fs, fetch });
    validator.setRuleset(ruleset);
    return validator;
  }
}

export class OpenapiValidationResult {
  private _findings: OpenApiValidationFindingDTO[] = [];

  constructor(diagnostics: ISpectralDiagnostic[]) {
    diagnostics.forEach((diagnostics) => {
      const finding = new OpenApiValidationFindingDTO(diagnostics);
      finding.severity = DiagnosticSeverity[finding.severity];
      this._findings.push(finding);
    });
  }

  public get DTO() {
    return this._findings;
  }

  public hasErrors(): boolean {
    return this._findings.some((err) => {
      return (
        err.severity === DiagnosticSeverity[DiagnosticSeverity.Error] ||
        err.code === 'unrecognized-format'
      );
    });
  }
}
