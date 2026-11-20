import * as migration_20261120_205816_initial from './20261120_205816_initial';
import * as migration_20261120_214044_design_pages from './20261120_214044_design_pages';
import * as migration_20261120_215034_s3_fields from './20261120_215034_s3_fields';
import * as migration_20261120_221007_check_request_attachments from './20261120_221007_check_request_attachments';
import * as migration_20261120_221013_remove_request_files from './20261120_221013_remove_request_files';
import * as migration_20261120_222731_consent_log from './20261120_222731_consent_log';

export const migrations = [
  {
    up: migration_20261120_205816_initial.up,
    down: migration_20261120_205816_initial.down,
    name: '20261120_205816_initial',
  },
  {
    up: migration_20261120_214044_design_pages.up,
    down: migration_20261120_214044_design_pages.down,
    name: '20261120_214044_design_pages',
  },
  {
    up: migration_20261120_215034_s3_fields.up,
    down: migration_20261120_215034_s3_fields.down,
    name: '20261120_215034_s3_fields',
  },
  {
    up: migration_20261120_221007_check_request_attachments.up,
    down: migration_20261120_221007_check_request_attachments.down,
    name: '20261120_221007_check_request_attachments',
  },
  {
    up: migration_20261120_221013_remove_request_files.up,
    down: migration_20261120_221013_remove_request_files.down,
    name: '20261120_221013_remove_request_files',
  },
  {
    up: migration_20261120_222731_consent_log.up,
    down: migration_20261120_222731_consent_log.down,
    name: '20261120_222731_consent_log'
  },
];
