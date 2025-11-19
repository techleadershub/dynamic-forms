// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import 'whatwg-fetch'
import { TextEncoder, TextDecoder } from 'util'
import { ReadableStream, WritableStream, TransformStream } from 'stream/web'

if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder
}
if (!global.TextDecoder) {
  global.TextDecoder = TextDecoder
}
if (!global.ReadableStream) {
  global.ReadableStream = ReadableStream
}
if (!global.WritableStream) {
  global.WritableStream = WritableStream
}
if (!global.TransformStream) {
  global.TransformStream = TransformStream
}

if (!global.BroadcastChannel) {
  class BroadcastChannelPolyfill {
    name
    onmessage = null
    constructor(name) {
      this.name = name
    }
    postMessage() {}
    close() {}
    addEventListener() {}
    removeEventListener() {}
  }
  global.BroadcastChannel = BroadcastChannelPolyfill
}

