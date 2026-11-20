import * as migration_20261120_205816_initial from './20261120_205816_initial'

export const migrations = [
  {
    up: migration_20261120_205816_initial.up,
    down: migration_20261120_205816_initial.down,
    name: '20261120_205816_initial',
  },
]
