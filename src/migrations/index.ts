import * as migration_20261120_205816_initial from './20261120_205816_initial';
import * as migration_20261120_214044_design_pages from './20261120_214044_design_pages';
import * as migration_20261120_215034_s3_fields from './20261120_215034_s3_fields';

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
    name: '20261120_215034_s3_fields'
  },
];
