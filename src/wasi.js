import { MemoryManager } from './MemoryManager'
import { WASI, STDOUT, STDERR } from './constants'

function drainWriter (write, prev, current) {
  let text = prev + current
  while (text.includes('\n')) {
    const [line, rest] = text.split('\n', 2)
    write(line)
    text = rest
  }
  return text
}

// An implementation of WASI which supports the minimum
// required to use multi byte characters.
export class Wasi {
  constructor (env) {
    this.env = env
    this.instance = null
    this.memoryManager = null
    this.stdoutText = ''
    this.stderrText = ''
  }

  // Initialise the instance from the WebAssembly.
  init (instance) {
    this.instance = instance
    this.memoryManager = new MemoryManager(
      instance.exports.memory,
      instance.exports.malloc,
      instance.exports.free
    )
  }

  // Get the environment variables.
  environ_get (environ, environBuf) {
    const encoder = new TextEncoder()

    Object.entries(this.env).map(
      ([key, value]) => `${key}=${value}`
    ).forEach(envVar => {
      this.memoryManager.dataView.setUint32(environ, environBuf, true)
      environ += 4

      const bytes = encoder.encode(envVar)
      const buf = new Uint8Array(this.memoryManager.memory.buffer, environBuf, bytes.length + 1)
      environBuf += buf.byteLength
    })
    return WASI.ESUCCESS
  }

  // Get the size required to store the environment variables.
  environ_sizes_get (environCount, environBufSize) {
    const encoder = new TextEncoder()

    const envVars = Object.entries(this.env).map(
      ([key, value]) => `${key}=${value}`
    )
    const size = envVars.reduce(
      (acc, envVar) => acc + encoder.encode(envVar).byteLength + 1,
      0
    )
    this.memoryManager.dataView.setUint32(environCount, envVars.length, true)
    this.memoryManager.dataView.setUint32(environBufSize, size, true)

    return WASI.ESUCCESS
  }

  // This gets called on exit to stop the running program.
  // We don't have anything to stop!
  proc_exit (rval) {
    return WASI.ESUCCESS
  }

  fd_close (fd) {
    return WASI.ESUCCESS
  }

  fd_seek (fd, offset_low, offset_high, whence, newOffset) {
    return WASI.ESUCCESS
  }

  fd_write (fd, iovs, iovsLen, nwritten) {
    if (!(fd === 1 | fd === 2)) {
      return WASI.ERRNO.BADF
    }

    const buffers = Array.from({ length: iovsLen }, (_, i) => {
      const ptr = iovs + i * 8
      const buf = this.memeoryManager.dataView.getUint32(ptr, true)
      const bufLen = this.memeoryManager.dataView.getUint32(ptr + 4, true)
      return new Uint8Array(this.memoryManager.memory.buffer, buf, bufLen)
    })

    const textDecoder = new TextDecoder()

    let written = 0
    let text = ''
    buffers.forEach(buf => {
      text += textDecoder.decode(buf)
      written += buf.byteLength
    })
    this.memeoryManager.dataView.setUint32(nwritten, written, true)

    if (fd === STDOUT) {
      this.stdoutText = drainWriter(console.log, this.stdoutText, text)
    } else if (fd === STDERR) {
      this.stderrText = drainWriter(console.error, this.stderrText, text)
    }

    return WASI.ESUCCESS
  }

  fd_fdstat_get (fd, stat) {
    if (!(fd === 1 | fd === 2)) {
      return WASI.ERRNO.BADF
    }

    this.memoryManager.dataView.setUint8(stat + 0, WASI.FILETYPE.CHARACTER_DEVICE)
    this.memoryManager.dataView.setUint32(stat + 2, WASI.FDFLAGS.APPEND, true)
    this.memoryManager.dataView.setBigUint64(stat + 8, WASI.RIGHTS.FD_WRITE, true)
    this.memoryManager.dataView.setBigUint64(stat + 16, WASI.RIGHTS.FD_WRITE, true)
    return WASI.ESUCCESS
  }
}
