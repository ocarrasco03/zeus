'use strict'
require('dotenv').config()
const { APP_KEY } = process.env
const cryptoRandomString = require('crypto-random-string')
const { readFile, writeFile } = require('fs')
const { Log, LogSlack } = require('./utils/logger')

const envKey = () => {
  readFile('.env', 'utf-8', (err, data) => {
    if (err) {
      Log('error', 'app-key', { exception: err })
      LogSlack(
        'error',
        'Key generator error',
        'Error trying to read env file',
        { color: '#bb2124', icon: ':beetle:' },
        err
      )
      throw err
    }
    const regex = APP_KEY ? new RegExp(`APP_KEY=${APP_KEY}`, 'gi') : new RegExp('APP_KEY=', 'gi')
    const appKey = data.replace(
      regex,
      `APP_KEY=${cryptoRandomString({ length: 45, type: 'base64' })}`
    )
    writeFile('.env', appKey, 'utf-8', (err) => {
      if (err) {
        Log('error', 'app-key', { exception: err })
        LogSlack(
          'error',
          'Key generator error',
          'Error trying to create app key',
          { color: '#bb2124', icon: ':beetle:' },
          err
        )
        throw err
      }
      Log('response', 'app-key', {
        exception: `Key generated successfully: base64(${process.env.APP_KEY})`
      })
      LogSlack(
        'alert',
        'Key generator warning',
        `Key generated successfully: base64(${process.env.APP_KEY})`,
        { color: '#f0ad4e', icon: ':warning:' }
      )
      console.log(
        `Key generated successfully: base64(${process.env.APP_KEY})`
      )
    })
  })
}

envKey()
