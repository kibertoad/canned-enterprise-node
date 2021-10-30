import { getApp } from './app'
import { getConfig } from './infrastructure/config'

const config = getConfig()

async function start() {
  const app = await getApp()

  try {
    await app.listen(config.app.port, config.app.bindAddress)
  } catch (err: any) {
    app.log.error(err.message)
    process.exit(1)
  }
}

start()
