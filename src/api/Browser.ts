import EventEmitter from 'events'
import { TSend } from '../protocol'
import Page from './Page'

class Browser extends EventEmitter {
  private _send: TSend

  constructor (arg: { send: TSend }) {
    super()

    this._send = arg.send
  }

  async close () {
    await this._send('Marionette:AcceptConnections', { value: false })
    await this._send('Marionette:Quit')

    this.emit('disconnected')
  }

  async disconnect () {
    await this._send('WebDriver:DeleteSession')

    this.emit('disconnected')
  }

  async newPage () {
    await this._send('WebDriver:ExecuteScript', {
      script: 'window.open()'
    })

    const pages: number[] = await this._send('WebDriver:GetWindowHandles')

    return new Page({
      browser: this,
      id: pages[pages.length - 1],
      send: this._send
    })
  }

  async pages () {
    const ids: number[] = await this._send('WebDriver:GetWindowHandles')

    return ids.map((id) => new Page({
      browser: this,
      id,
      send: this._send
    }))
  }
}

export default Browser