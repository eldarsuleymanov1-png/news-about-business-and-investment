import config from '@payload-config'
import { getPayload } from 'payload'
import { seedStructure } from './index'

const payload = await getPayload({ config })
await seedStructure(payload)
payload.logger.info('Seed finished')
process.exit(0)
