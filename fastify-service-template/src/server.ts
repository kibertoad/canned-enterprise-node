import { getApp } from './app'

const APP_PORT = process.env.APP_PORT ? Number.parseInt(process.env.APP_PORT) : 3000

async function start() {
  const app = await getApp()

  try {
    await app.listen({ port: APP_PORT })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
