// Taken from https://github.com/mistralai/client-js/blob/main/src/client.js
// Lib seems not actively maintained, and we need this patch: https://github.com/mistralai/client-js/pull/42

let isNode = false

let fetch

const VERSION = '0.0.3'
const RETRY_STATUS_CODES = [429, 500, 502, 503, 504]
const ENDPOINT = 'https://api.mistral.ai'

/**
 * Initialize fetch
 * @return {Promise<void>}
 */
async function initializeFetch() {
  if (typeof globalThis.fetch === 'undefined')
    throw new Error('No fetch implementation found')
  if (typeof window === 'undefined') {
    isNode = true
  }
  fetch = globalThis.fetch
}

initializeFetch()

/**
 * MistralAPIError
 * @return {MistralAPIError}
 * @extends {Error}
 */
class MistralAPIError extends Error {
  /**
   * A simple error class for Mistral API errors
   * @param {*} message
   */
  constructor(message) {
    super(message)
    this.name = 'MistralAPIError'
  }
}

/**
 * MistralClient
 * @return {MistralClient}
 */
class MistralClient {
  /**
   * A simple and lightweight client for the Mistral API
   * @param {*} apiKey can be set as an environment variable MISTRAL_API_KEY,
   * or provided in this parameter
   * @param {*} endpoint defaults to https://api.mistral.ai
   * @param {*} maxRetries defaults to 5
   * @param {*} timeout defaults to 120 seconds
   */
  constructor(
    apiKey = process.env.MISTRAL_API_KEY,
    endpoint = ENDPOINT,
    maxRetries = 5,
    timeout = 120
  ) {
    this.endpoint = endpoint
    this.apiKey = apiKey

    this.maxRetries = maxRetries
    this.timeout = timeout

    if (this.endpoint.indexOf('inference.azure.com')) {
      this.modelDefault = 'mistral'
    }
  }

  /**
   *
   * @param {*} method
   * @param {*} path
   * @param {*} request
   * @return {Promise<*>}
   */
  _request = async function (method, path, request) {
    const url = `${this.endpoint}/${path}`
    const options = {
      method: method,
      headers: {
        'User-Agent': `mistral-client-js/${VERSION}`,
        Accept: request?.stream ? 'text/event-stream' : 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: method !== 'get' ? JSON.stringify(request) : null,
      timeout: this.timeout * 1000,
    }

    for (let attempts = 0; attempts < this.maxRetries; attempts++) {
      try {
        const response = await fetch(url, options)

        if (response.ok) {
          if (request?.stream) {
            if (isNode) {
              return response.body
            } else {
              const reader = response.body.getReader()
              // Chrome does not support async iterators yet, so polyfill it
              const asyncIterator = async function* () {
                try {
                  while (true) {
                    // Read from the stream
                    const { done, value } = await reader.read()
                    // Exit if we're done
                    if (done) return
                    // Else yield the chunk
                    yield value
                  }
                } finally {
                  reader.releaseLock()
                }
              }

              return asyncIterator()
            }
          }
          return await response.json()
        } else if (RETRY_STATUS_CODES.includes(response.status)) {
          console.debug(
            `Retrying request on response status: ${response.status}`,
            `Response: ${await response.text()}`,
            `Attempt: ${attempts + 1}`
          )
          // eslint-disable-next-line max-len
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempts + 1) * 500)
          )
        } else {
          throw new MistralAPIError(
            `HTTP error! status: ${response.status} ` +
              `Response: \n${await response.text()}`
          )
        }
      } catch (error) {
        console.error(`Request failed: ${error.message}`)
        if (error.name === 'MistralAPIError') {
          throw error
        }
        if (attempts === this.maxRetries - 1) throw error
        // eslint-disable-next-line max-len
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempts + 1) * 500)
        )
      }
    }
    throw new Error('Max retries reached')
  }

  /**
   * Creates a chat completion request
   * @param {*} model
   * @param {*} messages
   * @param {*} tools
   * @param {*} temperature
   * @param {*} maxTokens
   * @param {*} topP
   * @param {*} randomSeed
   * @param {*} stream
   * @param {*} safeMode deprecated use safePrompt instead
   * @param {*} safePrompt
   * @param {*} toolChoice
   * @param {*} responseFormat
   * @return {Promise<Object>}
   */
  _makeChatCompletionRequest = function (
    model,
    messages,
    tools,
    temperature,
    maxTokens,
    topP,
    randomSeed,
    stream,
    safeMode,
    safePrompt,
    toolChoice,
    responseFormat
  ) {
    // if modelDefault and model are undefined, throw an error
    if (!model && !this.modelDefault) {
      throw new MistralAPIError('You must provide a model name')
    }
    return {
      model: model ?? this.modelDefault,
      messages: messages,
      tools: tools ?? undefined,
      temperature: temperature ?? undefined,
      max_tokens: maxTokens ?? undefined,
      top_p: topP ?? undefined,
      random_seed: randomSeed ?? undefined,
      stream: stream ?? undefined,
      safe_prompt: (safeMode || safePrompt) ?? undefined,
      tool_choice: toolChoice ?? undefined,
      response_format: responseFormat ?? undefined,
    }
  }

  /**
   * Returns a list of the available models
   * @return {Promise<Object>}
   */
  listModels = async function () {
    const response = await this._request('get', 'v1/models')
    return response
  }

  /**
   * A chat endpoint without streaming
   * @param {*} model the name of the model to chat with, e.g. mistral-tiny
   * @param {*} messages an array of messages to chat with, e.g.
   * [{role: 'user', content: 'What is the best French cheese?'}]
   * @param {*} tools  a list of tools to use.
   * @param {*} temperature the temperature to use for sampling, e.g. 0.5
   * @param {*} maxTokens the maximum number of tokens to generate, e.g. 100
   * @param {*} topP the cumulative probability of tokens to generate, e.g. 0.9
   * @param {*} randomSeed the random seed to use for sampling, e.g. 42
   * @param {*} safeMode deprecated use safePrompt instead
   * @param {*} safePrompt whether to use safe mode, e.g. true
   * @param {*} toolChoice the tool to use, e.g. 'auto'
   * @param {*} responseFormat the format of the response, e.g. 'json_format'
   * @return {Promise<Object>}
   */
  chat = async function ({
    model,
    messages,
    tools,
    temperature,
    maxTokens,
    topP,
    randomSeed,
    safeMode,
    safePrompt,
    toolChoice,
    responseFormat,
  }) {
    const request = this._makeChatCompletionRequest(
      model,
      messages,
      tools,
      temperature,
      maxTokens,
      topP,
      randomSeed,
      false,
      safeMode,
      safePrompt,
      toolChoice,
      responseFormat
    )
    const response = await this._request('post', 'v1/chat/completions', request)
    return response
  }

  /**
   * A chat endpoint that streams responses.
   * @param {*} model the name of the model to chat with, e.g. mistral-tiny
   * @param {*} messages an array of messages to chat with, e.g.
   * [{role: 'user', content: 'What is the best French cheese?'}]
   * @param {*} tools  a list of tools to use.
   * @param {*} temperature the temperature to use for sampling, e.g. 0.5
   * @param {*} maxTokens the maximum number of tokens to generate, e.g. 100
   * @param {*} topP the cumulative probability of tokens to generate, e.g. 0.9
   * @param {*} randomSeed the random seed to use for sampling, e.g. 42
   * @param {*} safeMode deprecated use safePrompt instead
   * @param {*} safePrompt whether to use safe mode, e.g. true
   * @param {*} toolChoice the tool to use, e.g. 'auto'
   * @param {*} responseFormat the format of the response, e.g. 'json_format'
   * @return {Promise<Object>}
   */
  chatStream = async function* ({
    model,
    messages,
    tools,
    temperature,
    maxTokens,
    topP,
    randomSeed,
    safeMode,
    safePrompt,
    toolChoice,
    responseFormat,
  }) {
    const request = this._makeChatCompletionRequest(
      model,
      messages,
      tools,
      temperature,
      maxTokens,
      topP,
      randomSeed,
      true,
      safeMode,
      safePrompt,
      toolChoice,
      responseFormat
    )
    const response = await this._request('post', 'v1/chat/completions', request)

    let buffer = ''
    const decoder = new TextDecoder()
    for await (const chunk of response) {
      buffer += decoder.decode(chunk, { stream: true })
      let firstNewline
      while ((firstNewline = buffer.indexOf('\n')) !== -1) {
        const chunkLine = buffer.substring(0, firstNewline)
        buffer = buffer.substring(firstNewline + 1)
        if (chunkLine.startsWith('data:')) {
          const json = chunkLine.substring(6).trim()
          if (json !== '[DONE]') {
            yield JSON.parse(json)
          }
        }
      }
    }
  }

  /**
   * An embeddings endpoint that returns embeddings for a single,
   * or batch of inputs
   * @param {*} model The embedding model to use, e.g. mistral-embed
   * @param {*} input The input to embed,
   * e.g. ['What is the best French cheese?']
   * @return {Promise<Object>}
   */
  embeddings = async function ({ model, input }) {
    const request = {
      model: model,
      input: input,
    }
    const response = await this._request('post', 'v1/embeddings', request)
    return response
  }
}

export default MistralClient
